import { z } from 'zod'

/*
  Course input rules. `createCourseSchema` requires every field; the update
  schema makes them all optional but insists on at least one, so a PATCH can't
  be a no-op. `.strict()` rejects unknown keys instead of silently dropping
  them, which turns a typo like `titel` into a clear 400.
*/
export const createCourseSchema = z
  .object({
    code: z.string().trim().min(2, 'Code is too short').max(12),
    title: z.string().trim().min(3, 'Title is too short').max(120),
    instructor: z.string().trim().min(2, 'Instructor is required').max(80),
    credits: z
      .number({ message: 'Credits must be a number' })
      .int('Credits must be a whole number')
      .min(1)
      .max(10),
  })
  .strict()

export const updateCourseSchema = createCourseSchema
  .partial()
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: 'Provide at least one field to update.',
  })
