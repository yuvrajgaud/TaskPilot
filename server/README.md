# TaskPilot API (server)

The TaskPilot REST API. Built in **Task 2** with Express over an in-memory
store, given real persistence in **Task 3** (PostgreSQL + Prisma), and secured
with JWT auth plus the AI planner in **Task 4**.

Full endpoint reference and an importable Postman collection live in
[`../docs/api/`](../docs/api/README.md).

## Run

```bash
cd server
npm install
npm run dev      # nodemon — restarts on change
# or: npm start
```

Listens on `http://localhost:4000/api`. Task 2 needs no `.env`; the defaults in
`.env.example` are enough. Copy it to `.env` only when you start overriding the
port or, later, adding the database and API keys.

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
├── src/
│   ├── index.js              # entry: starts the listener
│   ├── app.js                # builds the Express app (middleware + routes + errors)
│   ├── config.js             # env read once, with defaults
│   ├── data/
│   │   ├── seed.js           # initial data (mirrors the client's mock data)
│   │   └── store.js          # in-memory repository — the ONLY data-access module
│   ├── schemas/              # zod validation schemas per resource
│   ├── controllers/          # request → store → response
│   ├── routes/               # one router per resource, mounted under /api
│   ├── middleware/           # validate, notFound, errorHandler
│   └── lib/                  # ApiError, asyncHandler, response helpers
└── .env.example
```

**Task 3 boundary:** `data/store.js` is the single place that knows data lives
in memory. Swapping it for Prisma queries is the whole of the database task —
nothing in `controllers/` or `routes/` changes.
