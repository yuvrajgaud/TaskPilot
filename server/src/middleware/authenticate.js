import { unauthorized } from '../lib/ApiError.js'
import { verifyToken } from '../lib/auth.js'

/*
  Guards every route mounted after it. Expects `Authorization: Bearer <token>`,
  verifies the JWT, and attaches { id, email } to req.user for the controllers
  and the store to scope on. A missing, malformed or expired token is a 401,
  routed through the same error envelope as everything else.
*/
export function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ')

  if (scheme !== 'Bearer' || !token) {
    return next(unauthorized('Sign in to continue.'))
  }

  try {
    const payload = verifyToken(token)
    req.user = { id: payload.sub, email: payload.email }
    next()
  } catch {
    next(unauthorized('Your session is invalid or has expired. Sign in again.'))
  }
}
