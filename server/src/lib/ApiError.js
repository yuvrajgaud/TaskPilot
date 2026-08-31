/*
  One error type for every *expected* failure — a missing record, a bad
  reference, a conflict. Controllers throw these; the central error handler
  turns them into the JSON error envelope with the right status code. Anything
  that isn't an ApiError is treated as an unexpected 500.
*/
export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    if (details) this.details = details
  }
}

export const badRequest = (message = 'Bad request', details) =>
  new ApiError(400, 'BAD_REQUEST', message, details)

export const notFound = (message = 'Resource not found') =>
  new ApiError(404, 'NOT_FOUND', message)

export const conflict = (message = 'Conflict') =>
  new ApiError(409, 'CONFLICT', message)
