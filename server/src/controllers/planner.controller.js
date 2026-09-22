import { asyncHandler } from '../lib/asyncHandler.js'
import { ok } from '../lib/http.js'
import { badRequest, serviceUnavailable } from '../lib/ApiError.js'
import { isPlannerConfigured } from '../lib/gemini.js'
import { generateStudyPlan } from '../lib/planner.js'
import * as store from '../data/store.js'

/*
  POST /planner — the AI feature. It never trusts the client for *what* to plan:
  it reads the signed-in student's own courses and tasks from the store, keeps
  only the unfinished ones, and asks the planner to schedule them. The request
  body carries preferences only (horizon, hours a day, a focus note), already
  validated by plannerRequestSchema.

  The config check comes first so an unconfigured server answers with a clear
  503 before doing any database work.
*/
export const create = asyncHandler(async (req, res) => {
  if (!isPlannerConfigured()) {
    throw serviceUnavailable('The AI planner is not configured on this server.')
  }

  const [user, courses, tasks] = await Promise.all([
    store.getUser(req.user.id),
    store.listCourses(req.user.id),
    store.listTasks(req.user.id),
  ])

  const pending = tasks.filter((task) => task.status !== 'done')
  if (pending.length === 0) {
    throw badRequest('Add at least one unfinished task before generating a plan.')
  }

  ok(res, await generateStudyPlan({ user, courses, tasks: pending, prefs: req.body }))
})
