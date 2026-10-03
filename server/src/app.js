import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { config } from './config.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'
import { apiLimiter, authLimiter, plannerLimiter } from './middleware/rateLimit.js'
import routes from './routes/index.js'

/*
  Builds the Express app and returns it, without starting a listener — so the
  same app can be started by index.js or handed to a test runner later.
  The middleware order is deliberate:
    trust proxy → helmet → cors → json parsing → logging → limiters → routes
    → notFound → errorHandler
  The two error handlers must come last, after every route has had its chance.
*/
export function createApp() {
  const app = express()

  // Behind a hosting proxy (Render) the real client IP rides in X-Forwarded-For.
  // Trust the first hop so rate limiting keys on the caller, not the proxy.
  app.set('trust proxy', 1)

  // Security headers before anything can respond.
  app.use(helmet())

  // CORS is locked to the configured client origin(s) now that auth tokens ride
  // on requests — every other origin is refused. (Task 2 left this open.)
  app.use(cors({ origin: config.clientUrls }))
  app.use(express.json())
  if (config.nodeEnv !== 'test') app.use(morgan('dev'))

  // Liveness probe — cheap to hit from a browser or an uptime check. Declared
  // before the limiters so uptime pings never count against the rate limit.
  app.get('/api/health', (req, res) => {
    res.json({ data: { status: 'ok', service: 'taskpilot-api' } })
  })

  // A lenient ceiling on the whole API; sign-in and the AI planner get stricter,
  // purpose-built limiters (brute-force and Gemini-quota protection).
  app.use('/api', apiLimiter)
  app.use('/api/auth', authLimiter)
  app.use('/api/planner', plannerLimiter)

  app.use('/api', routes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
