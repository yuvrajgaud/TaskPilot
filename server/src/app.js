import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import { config } from './config.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'
import routes from './routes/index.js'

/*
  Builds the Express app and returns it, without starting a listener — so the
  same app can be started by index.js or handed to a test runner later.
  The middleware order is deliberate:
    cors → json parsing → request logging → routes → notFound → errorHandler
  The two error handlers must come last, after every route has had its chance.
*/
export function createApp() {
  const app = express()

  // CORS is open in Task 2: there are no cookies or credentials to protect yet.
  // Task 4 narrows this to the deployed client origin once auth is added.
  app.use(cors())
  app.use(express.json())
  if (config.nodeEnv !== 'test') app.use(morgan('dev'))

  // Liveness probe — cheap to hit from a browser or an uptime check.
  app.get('/api/health', (req, res) => {
    res.json({ data: { status: 'ok', service: 'taskpilot-api' } })
  })

  app.use('/api', routes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
