import { Router } from 'express'
import courses from './courses.routes.js'
import tasks from './tasks.routes.js'
import users from './users.routes.js'
import activity from './activity.routes.js'

/*
  Every resource router mounted under one place, so app.js stays a list of
  concerns (cors, json, logging, routes, errors) rather than a wall of routes.
*/
const router = Router()

router.use('/courses', courses)
router.use('/tasks', tasks)
router.use('/users', users)
router.use('/activity', activity)

export default router
