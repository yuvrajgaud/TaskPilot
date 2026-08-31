import { asyncHandler } from '../lib/asyncHandler.js'
import { ok } from '../lib/http.js'
import * as store from '../data/store.js'

// Auth lands in Task 4; until then "me" is the single seeded user.
export const getMe = asyncHandler(async (req, res) => {
  ok(res, store.getUser())
})

export const updateMe = asyncHandler(async (req, res) => {
  ok(res, store.updateUser(req.body))
})
