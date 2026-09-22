import { Router } from 'express'
import * as planner from '../controllers/planner.controller.js'
import { validate } from '../middleware/validate.js'
import { plannerRequestSchema } from '../schemas/planner.schema.js'

/*
  Mounted at /planner behind `authenticate` (see routes/index.js), so req.user
  is always set here. One endpoint: POST / generates a study plan for the
  signed-in student.
*/
const router = Router()

router.post('/', validate(plannerRequestSchema), planner.create)

export default router
