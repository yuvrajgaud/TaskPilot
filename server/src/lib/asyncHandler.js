/*
  Wraps an async route handler so a thrown error (or rejected promise) is
  forwarded to Express's error middleware instead of crashing the process.
  Keeps every controller free of repetitive try/catch, and means the switch
  to async Prisma calls in Task 3 needs no changes here.
*/
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)
