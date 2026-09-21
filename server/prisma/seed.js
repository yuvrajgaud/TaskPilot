/*
  Seed script — populates the database with the same world the client and the
  Task 2 API used, so the frontend sees a consistent set of courses and
  assignments. Run with `npm run db:seed` (or automatically by
  `prisma migrate reset`). It is idempotent: it clears the tables first, so
  running it twice leaves the same result rather than duplicating rows.

  The friendly seed ids (u_1, c_1, t_1, ...) are set explicitly so the API
  docs and Postman collection, which reference c_1 / t_1, keep working.
  Records created later through the API get generated cuid ids.
*/

import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma.js'
import {
  seedActivity,
  seedCourses,
  seedTasks,
  seedUser,
} from '../src/data/seed.js'

// Demo login for the seeded account. This is sample data for a throwaway dev
// database, so the credential is intentionally public — real accounts choose
// their own password at registration, and only the bcrypt hash is ever stored.
const DEMO_PASSWORD = 'taskpilot123'

async function main() {
  // Clear children before parents to respect the foreign keys.
  await prisma.task.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.course.deleteMany()
  await prisma.user.deleteMany()

  await prisma.user.create({
    data: { ...seedUser, password: await bcrypt.hash(DEMO_PASSWORD, 10) },
  })

  for (const course of seedCourses) {
    await prisma.course.create({ data: { ...course, userId: seedUser.id } })
  }

  for (const task of seedTasks) {
    await prisma.task.create({
      data: { ...task, dueDate: new Date(task.dueDate) },
    })
  }

  // The seed lists activity newest-first; stagger createdAt so that order
  // survives `orderBy: { createdAt: 'desc' }`.
  const now = Date.now()
  for (let i = 0; i < seedActivity.length; i++) {
    await prisma.activity.create({
      data: {
        ...seedActivity[i],
        userId: seedUser.id,
        createdAt: new Date(now - i * 60_000),
      },
    })
  }

  console.log(
    `Seeded ${seedCourses.length} courses, ${seedTasks.length} tasks and ` +
      `${seedActivity.length} activity items for ${seedUser.name}.`,
  )
  console.log(`Demo login — ${seedUser.email} / ${DEMO_PASSWORD}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err)
    await prisma.$disconnect()
    process.exit(1)
  })
