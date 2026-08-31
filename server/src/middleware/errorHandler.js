import { ZodError } from 'zod'
import { ApiError } from '../lib/ApiError.js'
import { config } from '../config.js'

/*
  The single place errors become responses. Three cases, in order:
    1. ZodError        → 400, with a details[] listing each bad field.
    2. malformed JSON  → 400 (express.json throws this before any handler).
    3. ApiError        → its own status/code/message.
  Anything else is an unexpected bug: log it server-side, return a generic 500
  so we never leak a stack trace or internal message to the client.
*/
// eslint-disable-next-line no-unused-vars -- Express identifies error middleware by its 4 args
export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: 'Validation failed.',
        code: 'VALIDATION_ERROR',
        details: err.issues.map((issue) => ({
          field: issue.path.join('.') || '(body)',
          message: issue.message,
        })),
      },
    })
  }

  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { message: 'Request body is not valid JSON.', code: 'INVALID_JSON' },
    })
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        code: err.code,
        ...(err.details ? { details: err.details } : {}),
      },
    })
  }

  if (config.nodeEnv !== 'test') console.error(err)
  return res.status(500).json({
    error: { message: 'Something went wrong on our end.', code: 'INTERNAL_ERROR' },
  })
}
