import { Router } from 'express'
import * as courses from '../controllers/courses.controller.js'
import { validate } from '../middleware/validate.js'
import {
  createCourseSchema,
  updateCourseSchema,
} from '../schemas/course.schema.js'

const router = Router()

router.get('/', courses.list)
router.post('/', validate(createCourseSchema), courses.create)
router.get('/:id', courses.getOne)
router.patch('/:id', validate(updateCourseSchema), courses.update)
router.delete('/:id', courses.remove)
router.get('/:id/tasks', courses.listCourseTasks)

export default router
