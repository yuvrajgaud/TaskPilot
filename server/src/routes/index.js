import { Router } from 'express'
import courses from './courses.routes.js'
import tasks from './tasks.routes.js'
import users from './users.routes.js'
import activity from './activity.routes.js'
import auth from './auth.routes.js'
import { authenticate } from '../middleware/authenticate.js'

/*
  Every resource router mounted under one place, so app.js stays a list of
  concerns (cors, json, logging, routes, errors) rather than a wall of routes.

  /auth is public — it is how you get a token. Everything below it passes through
  `authenticate` first, so the controllers can trust req.user and the store scopes
  every query to that user.
*/
const router = Router()

router.use('/auth', auth)

router.use('/courses', authenticate, courses)
router.use('/tasks', authenticate, tasks)
router.use('/users', authenticate, users)
router.use('/activity', authenticate, activity)

export default router
