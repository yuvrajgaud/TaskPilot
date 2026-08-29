import { daysUntil } from './dates'

/*
  Derived readings. Pages stay declarative by asking these functions questions
  instead of doing arithmetic inline.
*/

export function taskStats(tasks) {
  const done = tasks.filter((t) => t.status === 'done').length
  const open = tasks.length - done

  return {
    total: tasks.length,
    done,
    open,
    overdue: tasks.filter(
      (t) => t.status !== 'done' && daysUntil(t.dueDate) < 0,
    ).length,
    dueThisWeek: tasks.filter((t) => {
      if (t.status === 'done') return false
      const d = daysUntil(t.dueDate)
      return d >= 0 && d <= 7
    }).length,
    completionPct: tasks.length
      ? Math.round((done / tasks.length) * 100)
      : 0,
  }
}

/** Per-course rollup: how much is finished, and how much is on fire. */
export function courseProgress(course, tasks) {
  const mine = tasks.filter((t) => t.courseId === course.id)
  const stats = taskStats(mine)
  return { ...stats, tasks: mine }
}

/** Soonest-first, with finished work sinking to the bottom. */
export function byUrgency(a, b) {
  if (a.status === 'done' && b.status !== 'done') return 1
  if (b.status === 'done' && a.status !== 'done') return -1
  return new Date(a.dueDate) - new Date(b.dueDate)
}
