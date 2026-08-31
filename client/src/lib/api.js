import { activity, courses, currentUser, tasks } from '../data/mockData'

/*
  Stand-in API client for Task 1.

  Everything returns a Promise with a small artificial delay, so the loading and
  error states in the UI are real code paths rather than decoration. In Task 4
  the bodies of these functions become fetch() calls against the Task 2 API and
  nothing else in the app changes.

  Demo affordance: append ?state=empty, ?state=error or ?state=loading to the URL
  to force a state. Useful for screenshots and for showing all three states in
  the demo video without having to delete your data.
*/

const LATENCY_MS = 550

function scenario() {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('state')
}

function respond(data) {
  const forced = scenario()

  return new Promise((resolve, reject) => {
    if (forced === 'loading') return // never settles, so the skeleton stays up
    setTimeout(() => {
      if (forced === 'error') {
        reject(new Error('Could not reach the TaskPilot service.'))
      } else if (forced === 'empty') {
        resolve(Array.isArray(data) ? [] : data)
      } else {
        resolve(data)
      }
    }, LATENCY_MS)
  })
}

export const api = {
  getUser: () => respond(currentUser),
  getCourses: () => respond(courses),
  getTasks: () => respond(tasks),
  getActivity: () => respond(activity),

  // Single assignment, the way GET /tasks/:id will behave in Task 2: a missing
  // id is a genuine 404, not a transient failure, so it rejects with a flag the
  // detail page uses to show "not found" instead of a retry button.
  getTask: (id) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) {
      const err = new Error('That assignment could not be found.')
      err.notFound = true
      return Promise.reject(err)
    }
    return respond(task)
  },
}
