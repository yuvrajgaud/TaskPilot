# TaskPilot API

REST API for TaskPilot — users, courses and assignments, with JWT auth and an AI
study planner. Built in **Task 2** with Express, given PostgreSQL persistence in
**Task 3**, and secured with auth plus the Gemini-backed planner in **Task 4**.

- **Base URL:** `http://localhost:4000/api` (production:
  `https://taskpilot-api-911z.onrender.com/api`)
- **Format:** JSON in, JSON out (`Content-Type: application/json`)
- **Auth:** JWT. Register or log in, then send
  `Authorization: Bearer <token>`. Every route except `/health` and the two auth
  endpoints requires it — a missing or invalid token is a `401`.
- **Persistence:** PostgreSQL via Prisma; data survives restarts. See
  [`../db/`](../db/README.md) for the schema and diagram.

## Response shape

Every successful response wraps its payload in `data`:

```json
{ "data": { "id": "t_1", "title": "Implement AVL tree rotations" } }
```

Every error responds with an `error` object — never a raw string or an HTML
page — so clients can handle failures uniformly:

```json
{
  "error": {
    "message": "Validation failed.",
    "code": "VALIDATION_ERROR",
    "details": [{ "field": "credits", "message": "Credits must be a number" }]
  }
}
```

`details` is present only on validation errors, listing every field that failed.

## Status codes

| Code | Meaning                                                      |
| ---- | ----------------------------------------------------------- |
| 200  | OK — request succeeded                                       |
| 201  | Created — a new course or task was created                  |
| 204  | No Content — successful delete, empty body                  |
| 400  | Bad Request — validation failed, bad JSON, or unknown ref   |
| 404  | Not Found — no such record, or no such route                |
| 500  | Internal error — unexpected; the body never leaks internals |

## Endpoints

| Method | Path                     | Auth | Purpose                              |
| ------ | ------------------------ | ---- | ------------------------------------ |
| GET    | `/health`                | —    | Liveness check                       |
| POST   | `/auth/register`         | —    | Create an account → `{ user, token }` |
| POST   | `/auth/login`            | —    | Sign in → `{ user, token }`          |
| GET    | `/users/me`              | ✅   | The current user                     |
| PATCH  | `/users/me`              | ✅   | Update the current user's profile    |
| GET    | `/courses`               | ✅   | List the user's courses              |
| POST   | `/courses`               | ✅   | Create a course                      |
| GET    | `/courses/:id`           | ✅   | Get one course                       |
| PATCH  | `/courses/:id`           | ✅   | Update a course                      |
| DELETE | `/courses/:id`           | ✅   | Delete a course (and its tasks)      |
| GET    | `/courses/:id/tasks`     | ✅   | List tasks for a course              |
| GET    | `/tasks`                 | ✅   | List tasks (filterable — see below)  |
| POST   | `/tasks`                 | ✅   | Create a task                        |
| GET    | `/tasks/:id`             | ✅   | Get one task                         |
| PATCH  | `/tasks/:id`             | ✅   | Update a task                        |
| DELETE | `/tasks/:id`             | ✅   | Delete a task                        |
| GET    | `/activity`              | ✅   | Recent activity feed                 |
| POST   | `/planner`               | ✅   | Generate an AI study plan            |

### GET /tasks — filters

Combine any of these query parameters:

| Param    | Example              | Effect                                       |
| -------- | -------------------- | -------------------------------------------- |
| `course` | `?course=c_1`        | Only tasks in that course                    |
| `status` | `?status=todo`       | `todo` \| `in-progress` \| `done`            |
| `q`      | `?q=tree`            | Case-insensitive match on title *or* description |

Example: `GET /api/tasks?course=c_1&status=todo`.

## Resources

Every stored record also carries server-managed, read-only fields: a unique
`id`, plus `createdAt` and `updatedAt` timestamps (added in Task 3). You never
send these — they come back in responses.

### Course

```json
{ "code": "CS210", "title": "Operating Systems", "instructor": "Dr. V. Rao", "credits": 4 }
```

| Field        | Rules                                        |
| ------------ | -------------------------------------------- |
| `code`       | string, 2–12 chars, required                 |
| `title`      | string, 3–120 chars, required                |
| `instructor` | string, 2–80 chars, required                 |
| `credits`    | integer, 1–10, required                      |

`POST` requires all four. `PATCH` accepts any subset (but not an empty body).
Unknown fields are rejected.

### Task

```json
{
  "courseId": "c_1",
  "title": "Prepare OS lab demo",
  "status": "todo",
  "priority": "medium",
  "dueDate": "2026-10-01T00:00:00.000Z",
  "description": ""
}
```

| Field         | Rules                                                        |
| ------------- | ------------------------------------------------------------ |
| `courseId`    | string, required, **must reference an existing course**      |
| `title`       | string, 3–140 chars, required                                |
| `status`      | `todo` \| `in-progress` \| `done` — defaults to `todo`       |
| `priority`    | `low` \| `medium` \| `high` — defaults to `medium`           |
| `dueDate`     | ISO 8601 timestamp, required                                 |
| `description` | string, ≤ 600 chars, defaults to `""`                        |

A `courseId` that doesn't exist returns **400** (`BAD_REQUEST`), not a silent
orphan.

## Auth

Register once, then send the returned token on every subsequent request.

```bash
# Register — returns { data: { user, token } }
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Yuvraj Gaud","email":"you@example.com","password":"at-least-8-chars"}'

# Log in
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"at-least-8-chars"}'

# Use the token on a protected route
curl http://localhost:4000/api/courses -H "Authorization: Bearer <token>"
```

Passwords are hashed with bcrypt (never stored in plain text). A protected route
without a valid token is a **401**.

| Field      | Rules                                       |
| ---------- | ------------------------------------------- |
| `name`     | string, 2–80 chars, required (register)     |
| `email`    | valid email, required, unique               |
| `password` | string, 8–100 chars                         |

## AI planner

`POST /planner` reads the signed-in student's own courses and unfinished tasks
and asks Google Gemini for a day-by-day study plan. The request body carries
preferences only — never the data to plan.

```bash
curl -X POST http://localhost:4000/api/planner \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"horizonDays":7}'
```

| Field         | Rules                                        |
| ------------- | -------------------------------------------- |
| `horizonDays` | integer 1–30, defaults to `7`                |
| `hoursPerDay` | number 0.5–16, optional                      |
| `focus`       | string ≤ 500 chars, optional                 |

Requires at least one unfinished task, else **400**. If the server has no
Gemini key, **503**. Upstream failures surface as **502/503** with a clean
message — the model's raw error is never returned.

## Examples

Create a course:

```bash
curl -X POST http://localhost:4000/api/courses \
  -H "Content-Type: application/json" \
  -d '{"code":"CS210","title":"Operating Systems","instructor":"Dr. V. Rao","credits":4}'
```

Validation failure (missing/short fields) → `400`:

```bash
curl -X POST http://localhost:4000/api/courses \
  -H "Content-Type: application/json" \
  -d '{"code":"C","credits":"four"}'
# { "error": { "code": "VALIDATION_ERROR", "details": [ ... ] } }
```

Missing resource → `404`:

```bash
curl http://localhost:4000/api/tasks/does-not-exist
# { "error": { "message": "That assignment could not be found.", "code": "NOT_FOUND" } }
```

## Running it

```bash
cd server
npm install
npm run dev     # nodemon, restarts on change
# or: npm start
```

The API listens on `http://localhost:4000/api`. See `server/.env.example` for
the variables it needs — `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`,
`GEMINI_API_KEY` and `CLIENT_URL`.

## Postman

Import `taskpilot.postman_collection.json` (this folder) into Postman. It has a
`baseUrl` variable and a request for every endpoint, including the invalid ones
that demonstrate the `400` and `404` responses.
