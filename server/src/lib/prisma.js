import { PrismaClient } from '@prisma/client'
import { config } from '../config.js'

/*
  One PrismaClient for the whole process. It is cached on globalThis in
  development so nodemon's frequent reloads don't each open a fresh connection
  pool — a well-known Prisma + hot-reload gotcha that otherwise exhausts
  database connections.
*/
const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.__taskpilotPrisma ??
  new PrismaClient({
    log: config.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
  })

if (config.nodeEnv !== 'production') {
  globalForPrisma.__taskpilotPrisma = prisma
}
