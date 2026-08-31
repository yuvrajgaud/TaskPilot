import { asyncHandler } from '../lib/asyncHandler.js'
import { created, noContent, ok } from '../lib/http.js'
import { notFound } from '../lib/ApiError.js'
import * as store from '../data/store.js'

export const list = asyncHandler(async (req, res) => {
  ok(res, store.listCourses())
})

export const getOne = asyncHandler(async (req, res) => {
  const course = store.getCourse(req.params.id)
  if (!course) throw notFound('That course could not be found.')
  ok(res, course)
})

export const create = asyncHandler(async (req, res) => {
  created(res, store.createCourse(req.body))
})

export const update = asyncHandler(async (req, res) => {
  const course = store.updateCourse(req.params.id, req.body)
  if (!course) throw notFound('That course could not be found.')
  ok(res, course)
})

export const remove = asyncHandler(async (req, res) => {
  const deleted = store.deleteCourse(req.params.id)
  if (!deleted) throw notFound('That course could not be found.')
  noContent(res)
})

export const listCourseTasks = asyncHandler(async (req, res) => {
  if (!store.getCourse(req.params.id)) {
    throw notFound('That course could not be found.')
  }
  ok(res, store.listTasksByCourse(req.params.id))
})
