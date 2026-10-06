# TaskPilot API (server)

The TaskPilot REST API. Built in **Task 2** with Express over an in-memory
store, given real persistence in **Task 3** (PostgreSQL + Prisma), and secured
with JWT auth plus the AI planner in **Task 4**.

Full endpoint reference and an importable Postman collection live in
[`../docs/api/`](../docs/api/README.md). The database model, schema diagram and
design decisions live in [`../docs/db/`](../docs/db/README.md).

## Run

```bash
cd server
npm install
cp .env.example .env       # set DATABASE_URL, DIRECT_URL, JWT_SECRET, GEMINI_API_KEY, CLIENT_URL
npm run prisma:migrate     # create the tables
npm run db:seed            # load sample data
npm run dev                # nodemon — restarts on change
# or: npm start
```

Listens on `http://localhost:4000/api`. A `DATABASE_URL` and `JWT_SECRET` are
required — the server exits on startup with a clear message if either is
missing. `GEMINI_API_KEY` is optional: without it the rest of the API works and
the planner endpoint answers `503`.

## Auth (Task 4)

Accounts and sessions are stateless — no server-side session store.

- **Register / login:** `POST /api/auth/register` and `POST /api/auth/login`
  return `{ data: { user, token } }`. Passwords are hashed with **bcrypt**;
  only the hash is ever stored.
- **Token:** a signed **JWT** (`jsonwebtoken`) carrying the user id. The client
  sends it as `Authorization: Bearer <token>`.
- **Protected routes:** everything except `/health` and the two auth endpoints
  requires a valid token; missing or invalid → `401`.
- **Per-user isolation:** each query is scoped to the token's user, so one
  account can never read or modify another's courses, tasks or activity.

## AI planner (Task 4)

`POST /api/planner` reads the signed-in student's own courses and unfinished
tasks from the database and asks **Google Gemini** for a day-by-day study plan.

- The request body carries preferences only (`horizonDays`, `hoursPerDay`,
  `focus`) — never the data to plan, so the client can't plan someone else's work.
- The model is constrained with a JSON Schema (`responseJsonSchema`), so it
  returns structured JSON the UI can render directly, not free-form prose.
- Default model is `gemini-3-flash-preview`; override with the `GEMINI_MODEL`
  env var. Upstream failures map to `502`/`503` — no SDK error ever leaks out.

## Hardening (Task 4)

- **Helmet** — security headers (CSP, HSTS, `nosniff`, frame options) on every response.
- **CORS allowlist** — only the origin(s) in `CLIENT_URL` (comma-separated) are
  allowed; every other origin is refused.
- **Rate limiting** — lenient on the API as a whole, strict on `/auth`
  (brute-force), and quota-guarded on `/planner` (protects the Gemini key).
- **`trust proxy`** — set so limits key on the real client IP behind a host.

## Deploy (Task 4)

The API deploys to **Render** from [`../render.yaml`](../render.yaml), with the
database on **Neon**. Env vars are set in the Render dashboard, never the repo —
failing which the blueprint marks each secret `sync: false`. The build runs
`prisma generate` and `prisma migrate deploy` before the new version serves
traffic.

## Database (Task 3)

Data lives in **PostgreSQL**, accessed through **Prisma**. Any Postgres works —
a local install or a hosted one like Neon/Supabase — only the connection string
changes.

```bash
npm run prisma:migrate     # prisma migrate dev — create/apply a migration
npm run db:seed            # reset to the sample student, courses, tasks
npm run prisma:studio      # browse the data in a GUI
npm run prisma:generate    # regenerate the client after editing the schema
```

- **Schema:** `prisma/schema.prisma` — `User → Course → Task`, plus `Activity`.
- **Migrations:** committed under `prisma/migrations/`.
- **Config:** `DATABASE_URL` (pooled, app runtime) and `DIRECT_URL` (direct, for
  migrations) come from `.env` only — never hard-coded. See
  [`../docs/db/`](../docs/db/README.md) for the model, the diagram and the
  design decisions.

## What it does

- **Resources:** `courses` and `tasks` (full CRUD), plus `users/me` and
  `activity`. `GET /tasks` filters by `?course=`, `?status=` and `?q=`.
- **Consistent shape:** success is `{ "data": ... }`, errors are
  `{ "error": { message, code, details? } }` — never a raw string or HTML.
- **Validation:** every write body is checked with zod. A bad body is a `400`
  listing each offending field; a `courseId` that points nowhere is a `400`.
- **Errors in one place:** a central handler maps validation errors, malformed
  JSON, known `ApiError`s and unknown failures to the right status code, and
  never leaks internals on a `500`.

## Layout

```
server/
├── prisma/
│   ├── schema.prisma       # data model: User, Course, Task, Activity
│   ├── migrations/         # committed migration history
│   └── seed.js             # loads the sample data
├── src/
│   ├── index.js            # entry: checks DATABASE_URL, starts the listener
│   ├── app.js              # builds the Express app (middleware + routes + errors)
│   ├── config.js           # env read once, with defaults
│   ├── data/
│   │   ├── seed.js         # sample data (mirrors the client's mock data)
│   │   └── store.js        # data-access module — the ONLY place that touches Prisma
│   ├── schemas/            # zod validation schemas per resource
│   ├── controllers/        # request → store → response
│   ├── routes/             # one router per resource, mounted under /api
│   ├── middleware/         # validate, notFound, errorHandler
│   └── lib/                # prisma client, ApiError, asyncHandler, response helpers
└── .env.example
```

**Task 3 boundary:** `data/store.js` is the single place that knows where data
lives. Swapping its internals from in-memory arrays to Prisma queries was the
whole of the database task — nothing in `controllers/` or `routes/` changed,
only the store's functions became `async`.
