import { asyncHandler } from '../lib/asyncHandler.js'
import { created, noContent, ok } from '../lib/http.js'
import { badRequest, notFound } from '../lib/ApiError.js'
import * as store from '../data/store.js'

export const list = asyncHandler(async (req, res) => {
  const { course, status, q } = req.query
  ok(res, await store.listTasks(req.user.id, { course, status, q }))
})

export const getOne = asyncHandler(async (req, res) => {
  const task = await store.getTask(req.user.id, req.params.id)
  if (!task) throw notFound('That assignment could not be found.')
  ok(res, task)
})

export const create = asyncHandler(async (req, res) => {
  // A schema can validate the shape of courseId but not that it points at a real
  // course the caller owns — that check belongs here, against the store. An
  // unknown or someone else's courseId is a 400, not an orphaned task.
  if (!(await store.getCourse(req.user.id, req.body.courseId))) {
    throw badRequest('No course exists with that courseId.', [
      { field: 'courseId', message: 'Unknown course' },
    ])
  }
  created(res, await store.createTask(req.body))
})

export const update = asyncHandler(async (req, res) => {
  if (req.body.courseId && !(await store.getCourse(req.user.id, req.body.courseId))) {
    throw badRequest('No course exists with that courseId.', [
      { field: 'courseId', message: 'Unknown course' },
    ])
  }
  const task = await store.updateTask(req.user.id, req.params.id, req.body)
  if (!task) throw notFound('That assignment could not be found.')
  ok(res, task)
})

export const remove = asyncHandler(async (req, res) => {
  const deleted = await store.deleteTask(req.user.id, req.params.id)
  if (!deleted) throw notFound('That assignment could not be found.')
  noContent(res)
})
