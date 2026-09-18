import { createApp } from './app.js'
import { config } from './config.js'

// From Task 3 on, the API needs a database. Fail fast with a clear hint rather
// than a cryptic Prisma error on the first request.
if (!config.databaseUrl) {
  console.error(
    'DATABASE_URL is not set. Copy server/.env.example to server/.env, add your ' +
      'PostgreSQL connection string, then run `npm run prisma:migrate`. See docs/db/.',
  )
  process.exit(1)
}

const app = createApp()

app.listen(config.port, () => {
  console.log(
    `TaskPilot API listening on http://localhost:${config.port}/api  (${config.nodeEnv})`,
  )
})
