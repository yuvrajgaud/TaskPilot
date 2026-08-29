/*
  Deadline arithmetic. Urgency is the single most important derived value in
  TaskPilot — it drives the only colour the interface is allowed to use, so it
  lives in one place rather than being recalculated inside components.
*/

const DAY_MS = 24 * 60 * 60 * 1000

/** Midnight today, so "days until" counts calendar days rather than hours. */
function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/** Whole calendar days from today to `date`. Negative means overdue. */
export function daysUntil(date) {
  const target = new Date(date)
  const midnight = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  )
  return Math.round((midnight - startOfToday()) / DAY_MS)
}

/**
 * Urgency band for a due date. `done` short-circuits: finished work is never
 * urgent, no matter what its date says.
 */
export function urgencyOf(dueDate, status) {
  if (status === 'done') return 'done'
  const days = daysUntil(dueDate)
  if (days < 0) return 'overdue'
  if (days <= 2) return 'urgent'
  if (days <= 7) return 'soon'
  return 'ontrack'
}

/** Tailwind classes per band. Kept beside the bands so they can't drift apart. */
export const URGENCY_STYLES = {
  overdue: { text: 'text-urgent', bg: 'bg-urgent', wash: 'bg-urgent-wash' },
  urgent: { text: 'text-urgent', bg: 'bg-urgent', wash: 'bg-urgent-wash' },
  soon: { text: 'text-soon', bg: 'bg-soon', wash: 'bg-soon-wash' },
  ontrack: { text: 'text-ontrack', bg: 'bg-ontrack', wash: 'bg-ontrack-wash' },
  done: { text: 'text-mute', bg: 'bg-mute', wash: 'bg-panel' },
}

/** Short human phrasing for a due date: "Overdue 2d", "Today", "in 9d". */
export function dueLabel(dueDate, status) {
  if (status === 'done') return 'Done'
  const days = daysUntil(dueDate)
  if (days < 0) return `Overdue ${Math.abs(days)}d`
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `in ${days}d`
}

/** "12 Sep" — compact enough for a card corner. */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

/** A date `offset` days from today, for generating demo data. */
export function dateFromToday(offset) {
  return new Date(startOfToday().getTime() + offset * DAY_MS).toISOString()
}
