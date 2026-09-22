import { ApiError } from '@google/genai'
import { config } from '../config.js'
import { getGenAI } from './gemini.js'
import { badGateway, serviceUnavailable } from './ApiError.js'
import { studyPlanJsonSchema } from '../schemas/planner.schema.js'

/*
  The AI layer. Everything Gemini-specific lives here — the prompt, the request,
  and the mapping of SDK errors onto the API's own error envelope — so the
  controller stays thin and never imports the SDK directly.

  We use structured output (responseMimeType + responseJsonSchema) so the model
  must return JSON matching studyPlanJsonSchema, not free-form prose we then have
  to parse loosely. The request is non-streaming: a study plan is small and the
  endpoint is a plain request/response.
*/
const SYSTEM_PROMPT = [
  'You are TaskPilot, a study planner for university students.',
  "Given a student's courses and their unfinished tasks with due dates, you produce a realistic, day-by-day study plan.",
  '',
  'Follow these rules:',
  '- Never schedule work on a task that is already done.',
  "- Prioritise by due date and the task's own priority: what is due soonest and marked high comes first.",
  '- Break large tasks into focused sessions across several days rather than one long block; short, frequent sessions beat cramming.',
  "- Do not schedule more work in a day than the student's available hours allow. If they did not say, assume about 3 focused hours on weekdays and lighter weekends.",
  '- Spread the load: do not leave everything to the day before a deadline, and it is fine to leave a day light or free as a break.',
  '- Refer to tasks by their exact title and to courses by their code.',
  '- If the deadlines cannot realistically all be met, still produce the best possible plan and call out the risk in warnings.',
  '- Be concrete and encouraging, but never invent tasks, courses, or deadlines that were not provided.',
].join('\n')

const formatCourses = (courses) => {
  if (courses.length === 0) return 'No courses on record.'
  return courses
    .map((course) => `- ${course.code}: ${course.title} (${course.instructor}, ${course.credits} credits)`)
    .join('\n')
}

const formatTasks = (tasks, codeById) => {
  // tasks arrive already filtered to the unfinished ones and sorted by due date.
  return tasks
    .map((task) => {
      const code = codeById.get(task.courseId) || 'unknown course'
      const due = task.dueDate.toISOString().slice(0, 10)
      const description = task.description ? ` — ${task.description}` : ''
      return `- [${code}] "${task.title}" · due ${due} · priority ${task.priority}${description}`
    })
    .join('\n')
}

export const buildPrompt = ({ user, courses, tasks, prefs, today }) => {
  const codeById = new Map(courses.map((course) => [course.id, course.code]))
  const horizon = prefs.horizonDays ?? 7

  const lines = []
  lines.push(
    user
      ? `The student is ${user.name}${user.programme ? `, studying ${user.programme}` : ''}${user.term ? ` (${user.term})` : ''}.`
      : 'A university student.',
  )
  lines.push(`Today is ${today}. Plan the next ${horizon} day(s), starting today.`)
  lines.push(
    prefs.hoursPerDay
      ? `They have about ${prefs.hoursPerDay} hours a day to study.`
      : 'They did not say how many hours a day they have; use a sensible default.',
  )
  if (prefs.focus) lines.push(`Special request from the student: ${prefs.focus}`)
  lines.push('', 'Courses:', formatCourses(courses))
  lines.push('', 'Unfinished tasks (soonest due first):', formatTasks(tasks, codeById))
  lines.push('', `Produce a ${horizon}-day plan.`)
  return lines.join('\n')
}

export const generateStudyPlan = async ({ user, courses, tasks, prefs }) => {
  const ai = getGenAI()
  if (!ai) throw serviceUnavailable('The AI planner is not configured on this server.')

  const today = new Date().toISOString().slice(0, 10)
  const prompt = buildPrompt({ user, courses, tasks, prefs, today })

  let response
  try {
    response = await ai.models.generateContent({
      model: config.geminiModel,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseJsonSchema: studyPlanJsonSchema,
      },
    })
  } catch (err) {
    // Map the SDK's ApiError onto our envelope by HTTP status. A bad or missing
    // key (401/403) or being rate-limited (429 — common on the free tier) is a
    // server-side condition the student cannot fix, so it reads as 503; anything
    // else from the API is an upstream 502. We never leak the raw SDK error,
    // which can carry request details, to the client.
    if (err instanceof ApiError) {
      if (err.status === 429) {
        throw serviceUnavailable('The AI planner is busy right now. Please try again in a moment.')
      }
      if (err.status === 401 || err.status === 403) {
        throw serviceUnavailable('The AI planner is not configured correctly on this server.')
      }
      throw badGateway('The AI planner could not be reached. Please try again shortly.')
    }
    throw err
  }

  const text = response.text
  if (!text) {
    throw badGateway('The AI planner returned an empty plan. Please try again.')
  }

  let plan
  try {
    plan = JSON.parse(text)
  } catch {
    throw badGateway('The AI planner returned an unreadable plan. Please try again.')
  }

  // The schema is enforced by the API, but guard against a pathological response
  // so the client always gets either a well-formed plan or a clear error.
  if (!plan || typeof plan !== 'object' || !Array.isArray(plan.days)) {
    throw badGateway('The AI planner returned an unexpected plan. Please try again.')
  }

  return {
    plan,
    model: response.modelVersion ?? config.geminiModel,
    generatedAt: new Date().toISOString(),
  }
}
