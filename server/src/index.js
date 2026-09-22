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

// From Task 4 on, auth tokens are signed with this secret. Refuse to start
// without it rather than fall back to a guessable default.
if (!config.jwtSecret) {
  console.error(
    'JWT_SECRET is not set. Add a long random string to server/.env — it signs ' +
      'and verifies the auth tokens added in Task 4. See server/.env.example.',
  )
  process.exit(1)
}

// The AI planner is optional: without a key the server still runs and every
// other route works, but POST /api/planner returns 503. Warn so that is not a
// mystery during development.
if (!config.geminiApiKey) {
  console.warn(
    'GEMINI_API_KEY is not set — the AI planner (POST /api/planner) is disabled. ' +
      'Add a free key from aistudio.google.com/apikey to server/.env to enable it.',
  )
}

const app = createApp()

app.listen(config.port, () => {
  console.log(
    `TaskPilot API listening on http://localhost:${config.port}/api  (${config.nodeEnv})`,
  )
})
