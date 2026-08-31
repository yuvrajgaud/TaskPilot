# TaskPilot API

REST API for TaskPilot — users, courses and assignments. Built in **Task 2**
with Express. Task 2 stores data in memory; **Task 3** swaps that for
PostgreSQL via Prisma without changing any of the routes below.

- **Base URL:** `http://localhost:4000/api`
- **Format:** JSON in, JSON out (`Content-Type: application/json`)
- **Auth:** none yet — added in Task 4 (JWT).

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

| Method | Path                     | Purpose                              |
| ------ | ------------------------ | ------------------------------------ |
| GET    | `/health`                | Liveness check                       |
| GET    | `/users/me`              | The current user                     |
| PATCH  | `/users/me`              | Update the current user's profile    |
| GET    | `/courses`               | List all courses                     |
| POST   | `/courses`               | Create a course                      |
| GET    | `/courses/:id`           | Get one course                       |
| PATCH  | `/courses/:id`           | Update a course                      |
| DELETE | `/courses/:id`           | Delete a course (and its tasks)      |
| GET    | `/courses/:id/tasks`     | List tasks for a course              |
| GET    | `/tasks`                 | List tasks (filterable — see below)  |
| POST   | `/tasks`                 | Create a task                        |
| GET    | `/tasks/:id`             | Get one task                         |
| PATCH  | `/tasks/:id`             | Update a task                        |
| DELETE | `/tasks/:id`             | Delete a task                        |
| GET    | `/activity`              | Recent activity feed                 |

### GET /tasks — filters

Combine any of these query parameters:

| Param    | Example              | Effect                                       |
| -------- | -------------------- | -------------------------------------------- |
| `course` | `?course=c_1`        | Only tasks in that course                    |
| `status` | `?status=todo`       | `todo` \| `in-progress` \| `done`            |
| `q`      | `?q=tree`            | Case-insensitive match on title *or* description |

Example: `GET /api/tasks?course=c_1&status=todo`.

## Resources

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

The API listens on `http://localhost:4000/api`. No `.env` is required for
Task 2 — `server/.env.example` documents the variables the later tasks add.

## Postman

Import `taskpilot.postman_collection.json` (this folder) into Postman. It has a
`baseUrl` variable and a request for every endpoint, including the invalid ones
that demonstrate the `400` and `404` responses.
