# server

The TaskPilot REST API. Built in **Task 2** (Express), given real persistence in
**Task 3** (PostgreSQL + Prisma), and secured with JWT auth in **Task 4**.

Planned resources:

| Resource   | Endpoints                                            |
| ---------- | ---------------------------------------------------- |
| `/auth`    | `POST /register`, `POST /login`                      |
| `/users`   | `GET /me`, `PATCH /me`                               |
| `/courses` | `GET`, `POST`, `GET /:id`, `PATCH /:id`, `DELETE /:id` |
| `/tasks`   | `GET`, `POST`, `GET /:id`, `PATCH /:id`, `DELETE /:id` |
| `/plan`    | `POST` — AI assignment planner                       |

The response shape is already fixed by `client/src/data/mockData.js`, so the
frontend can move off mock data by changing one file.
