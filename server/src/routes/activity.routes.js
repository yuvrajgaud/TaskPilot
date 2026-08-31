import { Router } from 'express'
import * as activity from '../controllers/activity.controller.js'

const router = Router()

router.get('/', activity.list)

export default router
