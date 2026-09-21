import { z } from 'zod'

/*
  Registration and login bodies. Passwords are only length-checked here; hashing
  and the duplicate-email check happen in the controller. programme and term are
  optional at sign-up — a new user can fill them in later from their profile.
*/
export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100),
    programme: z.string().trim().max(120).optional(),
    term: z.string().trim().max(60).optional(),
  })
  .strict()

export const loginSchema = z
  .object({
    email: z.string().trim().email('Enter a valid email'),
    password: z.string().min(1, 'Password is required'),
  })
  .strict()
