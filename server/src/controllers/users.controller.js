import { asyncHandler } from '../lib/asyncHandler.js'
import { ok } from '../lib/http.js'
import * as store from '../data/store.js'

// "me" is whoever the token identifies — set by the authenticate middleware.
export const getMe = asyncHandler(async (req, res) => {
  ok(res, await store.getUser(req.user.id))
})

export const updateMe = asyncHandler(async (req, res) => {
  ok(res, await store.updateUser(req.user.id, req.body))
})
