import { z } from 'zod'

export const STATUSES = ['todo', 'in-progress', 'done']
export const PRIORITIES = ['low', 'medium', 'high']

/*
  Task input rules. `status` and `priority` default so a minimal create still
  produces a well-formed task. `dueDate` must be a full ISO timestamp — the
  same string the client's dateFromToday() emits — which keeps the deadline
  maths identical on both sides. courseId is required here but its *existence*
  is checked in the controller against the store (a 400 with a helpful message),
  since a schema can't know what courses exist.
*/
export const createTaskSchema = z
  .object({
    courseId: z.string().trim().min(1, 'courseId is required'),
    title: z.string().trim().min(3, 'Title is too short').max(140),
    status: z.enum(STATUSES).default('todo'),
    priority: z.enum(PRIORITIES).default('medium'),
    dueDate: z.string().datetime({ message: 'dueDate must be an ISO 8601 timestamp' }),
    description: z.string().trim().max(600).default(''),
  })
  .strict()

export const updateTaskSchema = z
  .object({
    courseId: z.string().trim().min(1),
    title: z.string().trim().min(3).max(140),
    status: z.enum(STATUSES),
    priority: z.enum(PRIORITIES),
    dueDate: z.string().datetime({ message: 'dueDate must be an ISO 8601 timestamp' }),
    description: z.string().trim().max(600),
  })
  .strict()
  .partial()
  .refine((body) => Object.keys(body).length > 0, {
    message: 'Provide at least one field to update.',
  })
