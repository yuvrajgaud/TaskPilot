/*
  Body validation as middleware. On success it replaces req.body with the
  parsed value — so defaults (status, priority) are applied and unknown fields
  are stripped before a controller ever sees them. On failure it forwards the
  ZodError, which the error handler renders as a 400 with per-field details.
*/
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)
  if (!result.success) return next(result.error)
  req.body = result.data
  next()
}
