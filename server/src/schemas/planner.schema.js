import { z } from 'zod'

/*
  The planner reads the signed-in student's own courses and unfinished tasks
  from the database — the request body only carries optional preferences that
  shape the plan. Everything is optional so `POST /planner` with an empty body
  still produces a sensible week. .strict() rejects unknown fields so typos in
  the body surface as a 400 rather than being silently ignored.
*/
export const plannerRequestSchema = z
  .object({
    horizonDays: z
      .number({ message: 'horizonDays must be a number' })
      .int('horizonDays must be a whole number')
      .min(1, 'horizonDays must be at least 1')
      .max(30, 'horizonDays cannot exceed 30')
      .default(7),
    hoursPerDay: z
      .number({ message: 'hoursPerDay must be a number' })
      .min(0.5, 'hoursPerDay must be at least 0.5')
      .max(16, 'hoursPerDay cannot exceed 16')
      .optional(),
    focus: z.string().trim().max(500, 'focus cannot exceed 500 characters').optional(),
  })
  .strict()

/*
  The shape we ask Gemini to return, as a standard JSON Schema passed to
  generateContent via config.responseJsonSchema. The model is constrained to
  emit JSON in exactly this structure, so the endpoint never parses free-form
  prose. Each `description` is sent to the model as guidance, so it is written
  for the model to read. (Hand-written rather than derived from a Zod schema
  because the pinned Zod version has no JSON Schema exporter.)
*/
export const studyPlanJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'days', 'warnings'],
  properties: {
    summary: {
      type: 'string',
      description:
        'Two or three sentences summarising the plan and the overall strategy for the period.',
    },
    days: {
      type: 'array',
      description: 'One entry per day of the plan, in chronological order starting from today.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['date', 'headline', 'sessions'],
        properties: {
          date: {
            type: 'string',
            description: 'The calendar date for this day of the plan, formatted as YYYY-MM-DD.',
          },
          headline: {
            type: 'string',
            description:
              'A short theme for the day, e.g. "Finish the DBMS report and start revising for the quiz".',
          },
          sessions: {
            type: 'array',
            description:
              'The study sessions for this day, in the order they should be done. May be empty for a rest day.',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['courseCode', 'taskTitle', 'focus', 'durationMinutes', 'priority'],
              properties: {
                courseCode: {
                  type: 'string',
                  description: 'The code of the course this session is for, e.g. CS301.',
                },
                taskTitle: {
                  type: 'string',
                  description: 'The exact title of the task being worked on, copied from the task list.',
                },
                focus: {
                  type: 'string',
                  description: 'What specifically to do in this study session.',
                },
                durationMinutes: {
                  type: 'integer',
                  description: 'Suggested length of the session in minutes.',
                },
                priority: {
                  type: 'string',
                  enum: ['high', 'medium', 'low'],
                  description: 'How urgent this session is, driven mainly by the due date.',
                },
              },
            },
          },
        },
      },
    },
    warnings: {
      type: 'array',
      description:
        'Deadline risks or overload the student should know about. An empty array if there are none.',
      items: { type: 'string' },
    },
  },
}
