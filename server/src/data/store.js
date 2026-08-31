import {
  seedActivity,
  seedCourses,
  seedTasks,
  seedUser,
} from './seed.js'

/*
  The data layer — the ONLY module that knows data lives in memory. Controllers
  call these functions and never touch an array directly, so Task 3 replaces the
  bodies here with Prisma queries and nothing upstream changes. That boundary is
  the whole point of keeping it in one file.

  Arrays are copied out of the seed so a server restart resets to a known state
  and the seed itself is never mutated.
*/

let user = { ...seedUser }
let courses = seedCourses.map((c) => ({ ...c }))
let tasks = seedTasks.map((t) => ({ ...t }))
const activity = seedActivity.map((a) => ({ ...a }))

// Continue the id sequence from the highest seeded number, so new ids never
// collide with seeded ones (c_1..c_4 → c_5, t_1..t_12 → t_13, ...).
const highestSuffix = (rows) =>
  rows.reduce((max, row) => Math.max(max, Number(row.id.split('_')[1]) || 0), 0)

let courseSeq = highestSuffix(courses)
let taskSeq = highestSuffix(tasks)

/* ---- courses ---- */

export const listCourses = () => courses.map((c) => ({ ...c }))

export const getCourse = (id) => {
  const course = courses.find((c) => c.id === id)
  return course ? { ...course } : null
}

export const createCourse = (input) => {
  const course = { id: `c_${++courseSeq}`, ...input }
  courses.push(course)
  return { ...course }
}

export const updateCourse = (id, patch) => {
  const course = courses.find((c) => c.id === id)
  if (!course) return null
  Object.assign(course, patch)
  return { ...course }
}

export const deleteCourse = (id) => {
  const before = courses.length
  courses = courses.filter((c) => c.id !== id)
  if (courses.length === before) return false
  // A course owns its tasks, so removing it removes them too — the same
  // cascade the Task 3 foreign key will enforce at the database level.
  tasks = tasks.filter((t) => t.courseId !== id)
  return true
}

/* ---- tasks ---- */

export const listTasks = ({ course, status, q } = {}) => {
  let rows = tasks
  if (course) rows = rows.filter((t) => t.courseId === course)
  if (status) rows = rows.filter((t) => t.status === status)
  if (q) {
    const needle = q.toLowerCase()
    rows = rows.filter(
      (t) =>
        t.title.toLowerCase().includes(needle) ||
        t.description.toLowerCase().includes(needle),
    )
  }
  return rows.map((t) => ({ ...t }))
}

export const listTasksByCourse = (courseId) =>
  tasks.filter((t) => t.courseId === courseId).map((t) => ({ ...t }))

export const getTask = (id) => {
  const task = tasks.find((t) => t.id === id)
  return task ? { ...task } : null
}

export const createTask = (input) => {
  const task = { id: `t_${++taskSeq}`, ...input }
  tasks.push(task)
  return { ...task }
}

export const updateTask = (id, patch) => {
  const task = tasks.find((t) => t.id === id)
  if (!task) return null
  Object.assign(task, patch)
  return { ...task }
}

export const deleteTask = (id) => {
  const before = tasks.length
  tasks = tasks.filter((t) => t.id !== id)
  return tasks.length !== before
}

/* ---- user & activity ---- */

export const getUser = () => ({ ...user })

export const updateUser = (patch) => {
  user = { ...user, ...patch }
  return { ...user }
}

export const listActivity = () => activity.map((a) => ({ ...a }))
