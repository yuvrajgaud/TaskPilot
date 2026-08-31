import { z } from 'zod'

/*
  The profile fields a user may change. Auth arrives in Task 4; for now there is
  a single seeded user and PATCH /users/me edits it in place.
*/
export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email('Enter a valid email'),
    programme: z.string().trim().max(120),
    term: z.string().trim().max(60),
  })
  .strict()
  .partial()
  .refine((body) => Object.keys(body).length > 0, {
    message: 'Provide at least one field to update.',
  })
