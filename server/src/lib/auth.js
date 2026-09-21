import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../config.js'

/*
  Auth primitives, kept in one place. A password only ever reaches the database
  as a bcrypt hash; sessions are stateless JWTs signed with JWT_SECRET and
  carried in the Authorization header. Nothing here touches the request or the
  database — that is the middleware's and the store's job.
*/

const SALT_ROUNDS = 10
const TOKEN_TTL = '7d'

export const hashPassword = (plain) => bcrypt.hash(plain, SALT_ROUNDS)

export const comparePassword = (plain, hash) => bcrypt.compare(plain, hash)

export const signToken = (user) =>
  jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: TOKEN_TTL,
  })

export const verifyToken = (token) => jwt.verify(token, config.jwtSecret)
