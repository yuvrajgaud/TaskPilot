import rateLimit from 'express-rate-limit'

/*
  Rate limiting for a public deployment (Task 4). Three tiers, because the
  endpoints have very different abuse profiles:
    - apiLimiter: a lenient ceiling on the whole API. An SPA fires several calls
      per page, so this sits high enough never to trip normal use, low enough to
      blunt scraping.
    - authLimiter: strict. /auth login and register are the brute-force targets,
      so a handful of attempts per window per IP is plenty.
    - plannerLimiter: the planner spends a real (free-tier) Gemini quota, so cap
      it per IP to stop one visitor draining the key.
  Behind Render's proxy express only sees the real client IP because app.js sets
  'trust proxy'; without that these would all key on the proxy address.

  The 429 body mirrors the API's error envelope ({ error: { message, code } }),
  so the client's api.request() surfaces it like any other failure.
*/
const minutes = (n) => n * 60 * 1000

const limited = (message) => ({
  error: { message, code: 'RATE_LIMITED' },
})

export const apiLimiter = rateLimit({
  windowMs: minutes(15),
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: limited('Too many requests — slow down and try again shortly.'),
})

export const authLimiter = rateLimit({
  windowMs: minutes(15),
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: limited('Too many sign-in attempts — wait a few minutes and try again.'),
})

export const plannerLimiter = rateLimit({
  windowMs: minutes(60),
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: limited('The planner is busy for now — try again in a little while.'),
})
