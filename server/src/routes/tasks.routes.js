import { Router } from 'express'
import * as tasks from '../controllers/tasks.controller.js'
import { validate } from '../middleware/validate.js'
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema.js'

const router = Router()

router.get('/', tasks.list)
router.post('/', validate(createTaskSchema), tasks.create)
router.get('/:id', tasks.getOne)
router.patch('/:id', validate(updateTaskSchema), tasks.update)
router.delete('/:id', tasks.remove)

export default router
