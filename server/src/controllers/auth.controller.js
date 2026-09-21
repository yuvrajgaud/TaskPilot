import { asyncHandler } from '../lib/asyncHandler.js'
import { created, ok } from '../lib/http.js'
import { conflict, unauthorized } from '../lib/ApiError.js'
import { comparePassword, hashPassword, signToken } from '../lib/auth.js'
import * as store from '../data/store.js'

// First letters of the first two words: "Yuvraj Gaud" -> "YG".
const initialsFrom = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, programme = '', term = '' } = req.body

  if (await store.findUserByEmail(email)) {
    throw conflict('An account with that email already exists.', [
      { field: 'email', message: 'Email already registered' },
    ])
  }

  const user = await store.createUser({
    name,
    email,
    programme,
    term,
    initials: initialsFrom(name),
    password: await hashPassword(password),
  })

  created(res, { user, token: signToken(user) })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const record = await store.findUserByEmail(email)

  // One message for "no such email" and "wrong password" alike — telling them
  // apart just reveals which emails have accounts.
  if (!record || !(await comparePassword(password, record.password))) {
    throw unauthorized('Incorrect email or password.')
  }

  ok(res, { user: await store.getUser(record.id), token: signToken(record) })
})
