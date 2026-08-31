import { asyncHandler } from '../lib/asyncHandler.js'
import { created, noContent, ok } from '../lib/http.js'
import { badRequest, notFound } from '../lib/ApiError.js'
import * as store from '../data/store.js'

export const list = asyncHandler(async (req, res) => {
  const { course, status, q } = req.query
  ok(res, store.listTasks({ course, status, q }))
})

export const getOne = asyncHandler(async (req, res) => {
  const task = store.getTask(req.params.id)
  if (!task) throw notFound('That assignment could not be found.')
  ok(res, task)
})

export const create = asyncHandler(async (req, res) => {
  // A schema can validate the shape of courseId but not that it points at a
  // real course — that check belongs here, against the store.
  if (!store.getCourse(req.body.courseId)) {
    throw badRequest('No course exists with that courseId.', [
      { field: 'courseId', message: 'Unknown course' },
    ])
  }
  created(res, store.createTask(req.body))
})

export const update = asyncHandler(async (req, res) => {
  if (req.body.courseId && !store.getCourse(req.body.courseId)) {
    throw badRequest('No course exists with that courseId.', [
      { field: 'courseId', message: 'Unknown course' },
    ])
  }
  const task = store.updateTask(req.params.id, req.body)
  if (!task) throw notFound('That assignment could not be found.')
  ok(res, task)
})

export const remove = asyncHandler(async (req, res) => {
  const deleted = store.deleteTask(req.params.id)
  if (!deleted) throw notFound('That assignment could not be found.')
  noContent(res)
})
