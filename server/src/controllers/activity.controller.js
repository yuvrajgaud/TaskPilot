import { asyncHandler } from '../lib/asyncHandler.js'
import { ok } from '../lib/http.js'
import * as store from '../data/store.js'

export const list = asyncHandler(async (req, res) => {
  ok(res, store.listActivity())
})
