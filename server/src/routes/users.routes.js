import { Router } from 'express'
import * as users from '../controllers/users.controller.js'
import { validate } from '../middleware/validate.js'
import { updateUserSchema } from '../schemas/user.schema.js'

const router = Router()

router.get('/me', users.getMe)
router.patch('/me', validate(updateUserSchema), users.updateMe)

export default router
