import { prisma } from '../lib/prisma.js'

/*
  The data layer — still the ONLY module that knows where data physically lives.
  Task 2 used an in-memory array; Task 3 moved to PostgreSQL via Prisma; Task 4
  makes every query user-aware. A userId (from the authenticated request) is
  passed in, and courses, tasks and activity are all scoped to that owner, so one
  student can never read or change another's data.

  A task's owner is reached through its course (task -> course -> user), so task
  queries filter on the related course's userId rather than duplicating a userId
  on the task itself.

  Prisma raises P2025 ("record not found") on an update/delete of a missing row.
  We scope writes with updateMany / deleteMany and report "not found" through a
  zero count — keeping the same null / false signals the controllers branch on,
  and making "someone else's id" indistinguishable from "no such id".
*/

// The user fields the API may return — never the password hash.
const USER_PUBLIC = {
  id: true,
  name: true,
  initials: true,
  email: true,
  programme: true,
  term: true,
  createdAt: true,
  updatedAt: true,
}

/* ---- auth & user ---- */

// Includes the password hash — used only by login, to compare. Every other read
// goes through getUser, which never selects the password.
export const findUserByEmail = (email) =>
  prisma.user.findUnique({ where: { email } })

export const createUser = (data) =>
  prisma.user.create({ data, select: USER_PUBLIC })

export const getUser = (userId) =>
  prisma.user.findUnique({ where: { id: userId }, select: USER_PUBLIC })

export const updateUser = (userId, patch) =>
  prisma.user.update({ where: { id: userId }, data: patch, select: USER_PUBLIC })

/* ---- courses (scoped to the owner) ---- */

export const listCourses = (userId) =>
  prisma.course.findMany({ where: { userId }, orderBy: { code: 'asc' } })

export const getCourse = (userId, id) =>
  prisma.course.findFirst({ where: { id, userId } })

export const createCourse = (userId, input) =>
  prisma.course.create({ data: { ...input, userId } })

export const updateCourse = async (userId, id, patch) => {
  const { count } = await prisma.course.updateMany({
    where: { id, userId },
    data: patch,
  })
  if (count === 0) return null
  return prisma.course.findUnique({ where: { id } })
}

export const deleteCourse = async (userId, id) => {
  // Tasks are removed by the onDelete: Cascade foreign key.
  const { count } = await prisma.course.deleteMany({ where: { id, userId } })
  return count > 0
}

/* ---- tasks (scoped through the owning course) ---- */

export const listTasks = (userId, { course, status, q } = {}) => {
  const where = { course: { userId } }
  if (course) where.courseId = course
  if (status) where.status = status
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ]
  }
  return prisma.task.findMany({ where, orderBy: { dueDate: 'asc' } })
}

export const listTasksByCourse = (userId, courseId) =>
  prisma.task.findMany({
    where: { courseId, course: { userId } },
    orderBy: { dueDate: 'asc' },
  })

export const getTask = (userId, id) =>
  prisma.task.findFirst({ where: { id, course: { userId } } })

export const createTask = (input) =>
  prisma.task.create({ data: { ...input, dueDate: new Date(input.dueDate) } })

export const updateTask = async (userId, id, patch) => {
  // dueDate arrives as an ISO string; the column is a DateTime.
  const data = patch.dueDate
    ? { ...patch, dueDate: new Date(patch.dueDate) }
    : patch
  const { count } = await prisma.task.updateMany({
    where: { id, course: { userId } },
    data,
  })
  if (count === 0) return null
  return prisma.task.findUnique({ where: { id } })
}

export const deleteTask = async (userId, id) => {
  const { count } = await prisma.task.deleteMany({
    where: { id, course: { userId } },
  })
  return count > 0
}

/* ---- activity ---- */

export const listActivity = (userId) =>
  prisma.activity.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
