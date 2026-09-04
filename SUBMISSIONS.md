# Submissions

Every task is submitted from this one repository. Each task has its own git tag
and GitHub Release, so the code at submission time is frozen and reviewable
independently of later work.

| Task | Status | Repository URL to submit | LinkedIn |
| ---- | ------ | ------------------------ | ------ |
| 1 — Modern Frontend Development | Completed | [`task-1`](https://github.com/yuvrajgaud/TaskPilot/releases/tag/task-1) | [`Post`](https://lnkd.in/p/dY2FPymM) |
| 2 — Backend & REST API | Completed | [`task-2`](https://github.com/yuvrajgaud/TaskPilot/releases/tag/task-2) | [`Post`](https://lnkd.in/p/d-4Ez92u) |
| 3 — Database Integration | In progress | [`task-3`](https://github.com/yuvrajgaud/TaskPilot/releases/tag/task-3) | — |
| 4 — Final Full-Stack Application | Not started | [`task-4`](https://github.com/yuvrajgaud/TaskPilot/releases/tag/task-4) | — |

---

## Task 1 — Modern Frontend Development

**Requirement checklist**

- [x] Responsive layout (mobile, tablet, desktop)
- [x] Navigation bar with routing
- [x] Dashboard / landing page
- [x] List or card view of data
- [x] Detail view
- [x] Search and filter
- [x] Loading and empty states
- [x] Error state handling
- [x] Reusable component structure
- [x] Consistent design system
- [x] Screenshots in README
- [x] Demo video (2–3 min)
- [x] Tagged and released

**Demo video must show:** resize to mobile on camera, the empty state, the
loading skeleton, and search + filter working together.

---

## Task 2 — Backend & REST API

- [x] Express server with structured routing
- [x] CRUD endpoints for users, courses, tasks
- [x] Request validation
- [x] Centralised error handling with correct status codes
- [x] Consistent JSON response shape
- [x] API documentation (`docs/api/`)
- [x] Screenshots / Postman collection
- [x] Demo video
- [x] Tagged and released

**Demo video must show:** a validation failure returning `400` with a clean
error body, and a `404` on a missing resource. Most submissions only demo the
happy path.

---

## Task 3 — Database Integration

- [ ] PostgreSQL schema via Prisma
- [ ] Modelled relationships (user → courses → tasks)
- [ ] Migrations committed
- [ ] Seed script
- [ ] Real CRUD against the database
- [ ] Secure configuration — connection string from env, never hard-coded
- [ ] Schema diagram in `docs/`
- [ ] Demo video
- [ ] Tagged and released

**Demo video must show:** creating a record, restarting the server, and the
record still being there. That is the whole point of the task.

---

## Task 4 — Final Full-Stack Application

- [ ] Registration and login
- [ ] JWT auth with protected routes
- [ ] Password hashing
- [ ] Frontend wired to the real API
- [ ] AI Assignment Planner
- [ ] Deployment _(optional per the guide)_
- [ ] Final README with full setup instructions
- [ ] Capstone demo video
- [ ] Tagged and released

**Demo video must lead with the AI planner**, not with login. Auth is expected;
the planner is the differentiator.
