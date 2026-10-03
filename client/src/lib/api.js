import { relativeTime } from './dates'

/*
  The one module that knows where TaskPilot's data lives.

  Task 1 shipped a mock client with simulated latency; Task 4 replaces the bodies
  with real fetch() calls against the Express API. Because every page talks to the
  app only through these method names and return shapes, that swap is a one-file
  change — nothing in the components had to move. The auth token is threaded in
  here too: held in memory for the session and mirrored to localStorage so a
  reload stays signed in.

  The API speaks a consistent envelope: { data } on success, { error: { message,
  code, details? } } on failure, and 204 with no body on delete. request()
  unwraps that envelope so callers get plain data or a thrown Error carrying
  .status, .code, .details (per-field validation messages), plus .unauthorized
  (401) and .notFound (404) flags the pages branch on.

  Demo affordance kept from Task 1: append ?state=empty|error|loading to the URL
  to force a read into that state, so the three UI states stay reachable for
  screenshots and the demo video without touching real data. It shapes list reads
  only — never auth, so forcing a state can't lock you out.
*/

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace(/\/+$/, '')

const TOKEN_KEY = 'taskpilot.token'

// The token lives in memory for the session and in localStorage so a refresh
// keeps you signed in. Storage access is wrapped because it throws in some
// private-browsing modes — the in-memory copy is enough to stay usable there.
let token = readStoredToken()

function readStoredToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getToken() {
  return token
}

export function setToken(next) {
  token = next
  try {
    if (next) window.localStorage.setItem(TOKEN_KEY, next)
    else window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Storage unavailable — the in-memory token still carries this tab.
  }
}

function buildError(errorBody, status) {
  const err = new Error(
    errorBody?.message ?? 'Something went wrong. Please try again.',
  )
  err.status = status
  err.code = errorBody?.code
  err.details = errorBody?.details
  if (status === 401) err.unauthorized = true
  if (status === 404) err.notFound = true
  return err
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    // fetch only rejects on a network-level failure (server down, no connection,
    // CORS). Give the UI a human sentence rather than the raw "Failed to fetch".
    throw new Error(
      'Could not reach TaskPilot. Check your connection and try again.',
    )
  }

  if (res.status === 204) return null

  let payload = null
  try {
    payload = await res.json()
  } catch {
    // A non-JSON body on an error status (a proxy's own 502 page, say) must still
    // surface as a clean error rather than a JSON-parse crash.
    if (!res.ok) {
      throw buildError({ message: 'The server returned an unexpected response.' }, res.status)
    }
    return null
  }

  if (!res.ok) throw buildError(payload?.error, res.status)
  return payload?.data
}

function scenario() {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('state')
}

/*
  Preserves Task 1's ?state= affordance for list reads only. `loading` never
  settles so the skeleton stays up; `error` rejects; `empty` resolves to a blank
  shape. With no override it just runs the real request.
*/
function withScenario(run, emptyValue) {
  const forced = scenario()
  if (!forced) return run()
  if (forced === 'loading') return new Promise(() => {})
  if (forced === 'error') {
    return Promise.reject(new Error('Could not reach the TaskPilot service.'))
  }
  if (forced === 'empty') return Promise.resolve(emptyValue)
  return run()
}

function toQuery(params) {
  if (!params) return ''
  const usp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== '') usp.set(key, value)
  }
  const q = usp.toString()
  return q ? `?${q}` : ''
}

export const api = {
  // ---- auth (token handling lives in AuthProvider, which calls setToken) ----
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  logout: () => setToken(null),

  // ---- user ----
  getUser: () => request('/users/me'),
  updateUser: (patch) => request('/users/me', { method: 'PATCH', body: patch }),

  // ---- courses ----
  getCourses: () => withScenario(() => request('/courses'), []),
  createCourse: (body) => request('/courses', { method: 'POST', body }),
  updateCourse: (id, patch) =>
    request(`/courses/${id}`, { method: 'PATCH', body: patch }),
  deleteCourse: (id) => request(`/courses/${id}`, { method: 'DELETE' }),

  // ---- tasks ----
  getTasks: (params) => withScenario(() => request(`/tasks${toQuery(params)}`), []),

  // A missing id is a genuine 404, not a transient failure — request() flags it
  // .notFound so the detail page shows "no such assignment" instead of a retry.
  getTask: (id) => request(`/tasks/${id}`),
  createTask: (body) => request('/tasks', { method: 'POST', body }),
  updateTask: (id, patch) =>
    request(`/tasks/${id}`, { method: 'PATCH', body: patch }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  // ---- activity ----
  // The API stores an ISO createdAt; the log wants a relative "2h ago", so the
  // shape is normalised here rather than in the view.
  getActivity: () =>
    withScenario(async () => {
      const items = await request('/activity')
      return items.map((item) => ({ ...item, at: relativeTime(item.createdAt) }))
    }, []),

  // ---- AI planner ----
  generatePlan: (body) => request('/planner', { method: 'POST', body }),
}
