import { prisma } from '../lib/prisma.js'

/*
  The data layer — still the ONLY module that knows where data physically lives.
  In Task 2 that was an in-memory array; in Task 3 it is PostgreSQL via Prisma.
  Nothing upstream changed except that these functions are now async, so
  controllers await them: promise in, promise out. Routes are untouched.

  Prisma raises P2025 ("record not found") when an update or delete targets a
  missing row. We translate that into the same null / false "not found" signals
  the controllers already branch on, so the 404 logic upstream stays identical.
*/

const NOT_FOUND = 'P2025'

// Pre-auth, the app has a single user. Task 4 replaces this with the
// authenticated user from the request.
const currentUser = () => prisma.user.findFirst()

/* ---- courses ---- */

export const listCourses = () =>
  prisma.course.findMany({ orderBy: { code: 'asc' } })

export const getCourse = (id) => prisma.course.findUnique({ where: { id } })

export const createCourse = async (input) => {
  const user = await currentUser()
  return prisma.course.create({ data: { ...input, userId: user.id } })
}

export const updateCourse = async (id, patch) => {
  try {
    return await prisma.course.update({ where: { id }, data: patch })
  } catch (err) {
    if (err.code === NOT_FOUND) return null
    throw err
  }
}

export const deleteCourse = async (id) => {
  try {
    // Tasks are removed by the onDelete: Cascade foreign key.
    await prisma.course.delete({ where: { id } })
    return true
  } catch (err) {
    if (err.code === NOT_FOUND) return false
    throw err
  }
}

/* ---- tasks ---- */

export const listTasks = ({ course, status, q } = {}) => {
  const where = {}
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

export const listTasksByCourse = (courseId) =>
  prisma.task.findMany({ where: { courseId }, orderBy: { dueDate: 'asc' } })

export const getTask = (id) => prisma.task.findUnique({ where: { id } })

export const createTask = (input) =>
  prisma.task.create({ data: { ...input, dueDate: new Date(input.dueDate) } })

export const updateTask = async (id, patch) => {
  // dueDate arrives as an ISO string; the column is a DateTime.
  const data = patch.dueDate
    ? { ...patch, dueDate: new Date(patch.dueDate) }
    : patch
  try {
    return await prisma.task.update({ where: { id }, data })
  } catch (err) {
    if (err.code === NOT_FOUND) return null
    throw err
  }
}

export const deleteTask = async (id) => {
  try {
    await prisma.task.delete({ where: { id } })
    return true
  } catch (err) {
    if (err.code === NOT_FOUND) return false
    throw err
  }
}

/* ---- user & activity ---- */

export const getUser = () => currentUser()

export const updateUser = async (patch) => {
  const user = await currentUser()
  return prisma.user.update({ where: { id: user.id }, data: patch })
}

export const listActivity = () =>
  prisma.activity.findMany({ orderBy: { createdAt: 'desc' } })
