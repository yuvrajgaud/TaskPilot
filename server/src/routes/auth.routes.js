import { Router } from 'express'
import * as auth from '../controllers/auth.controller.js'
import { validate } from '../middleware/validate.js'
import { loginSchema, registerSchema } from '../schemas/auth.schema.js'

const router = Router()

router.post('/register', validate(registerSchema), auth.register)
router.post('/login', validate(loginSchema), auth.login)

export default router
