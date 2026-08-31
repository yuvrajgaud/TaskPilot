import { ApiError } from '../lib/ApiError.js'

/*
  Reached only when no route matched. Turns an unknown URL into a normal 404
  that flows through the same error envelope as everything else, rather than
  Express's default HTML page.
*/
export function notFound(req, res, next) {
  next(
    new ApiError(
      404,
      'NOT_FOUND',
      `Cannot ${req.method} ${req.originalUrl} — no such route.`,
    ),
  )
}
