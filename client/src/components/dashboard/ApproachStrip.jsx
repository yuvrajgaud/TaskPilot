import { cn } from '../../lib/cn'
import { URGENCY_STYLES, daysUntil, urgencyOf } from '../../lib/dates'
import { Panel } from '../ui/Panel'
import { Skeleton } from '../ui/States'

/*
  The Approach strip — TaskPilot's signature view.

  A 14-day glide path. Every unfinished assignment is plotted on the day it's
  due, so deadline *clustering* becomes visible: three markers stacked on one day
  is the thing a list view will never show you. Overdue work can't sit on a
  future timeline, so it collects in a separate block at the left.
*/

const WINDOW_DAYS = 14

export function ApproachStrip({ tasks, courses, loading }) {
  if (loading) {
    return (
      <Panel className="p-5">
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="mt-6 h-16 w-full" />
      </Panel>
    )
  }

  const open = tasks.filter((t) => t.status !== 'done')
  const codeOf = (courseId) =>
    courses.find((c) => c.id === courseId)?.code ?? '—'

  const overdue = open.filter((t) => daysUntil(t.dueDate) < 0)
  const beyond = open.filter((t) => daysUntil(t.dueDate) > WINDOW_DAYS)

  // Group the in-window work by day so stacked deadlines are obvious.
  const byDay = new Map()
  for (const task of open) {
    const day = daysUntil(task.dueDate)
    if (day < 0 || day > WINDOW_DAYS) continue
    if (!byDay.has(day)) byDay.set(day, [])
    byDay.get(day).push(task)
  }

  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule px-5 py-3.5">
        <p className="eyebrow">Approach — next {WINDOW_DAYS} days</p>
        <p className="tabular text-[11px] font-bold text-graphite">
          {open.length - beyond.length} plotted
          {beyond.length > 0 && (
            <span className="text-mute"> · {beyond.length} beyond</span>
          )}
        </p>
      </div>

      <div className="flex items-stretch">
        {overdue.length > 0 && (
          <div className="flex shrink-0 flex-col justify-end border-r border-dashed border-rule bg-urgent-wash px-3 py-4 sm:px-4">
            <p className="tabular text-lg leading-none font-bold text-urgent">
              {overdue.length}
            </p>
            <p className="mt-1 text-[10px] leading-tight font-semibold tracking-wide text-urgent uppercase">
              Behind
            </p>
          </div>
        )}

        <div className="min-w-0 flex-1 px-5 pt-5 pb-3">
          <div className="relative h-20">
            {/* The runway */}
            <div className="absolute bottom-5 h-px w-full bg-rule" />

            {/* Day ticks — every day, taller at the week marks */}
            {Array.from({ length: WINDOW_DAYS + 1 }, (_, day) => (
              <span
                key={day}
                className={cn(
                  'absolute bottom-5 w-px',
                  day % 7 === 0 ? 'h-2 bg-graphite' : 'h-1 bg-rule',
                )}
                style={{ left: `${(day / WINDOW_DAYS) * 100}%` }}
                aria-hidden
              />
            ))}

            {/* Plotted assignments */}
            {[...byDay.entries()].map(([day, items], i) => (
              <div
                key={day}
                className="tick-in absolute bottom-7 flex -translate-x-1/2 flex-col-reverse items-center gap-1"
                style={{
                  left: `${(day / WINDOW_DAYS) * 100}%`,
                  animationDelay: `${i * 45}ms`,
                }}
              >
                {items.slice(0, 3).map((task) => {
                  const band = urgencyOf(task.dueDate, task.status)
                  return (
                    <span
                      key={task.id}
                      title={`${codeOf(task.courseId)} — ${task.title}`}
                      className={cn(
                        'size-2.5 rounded-sm',
                        URGENCY_STYLES[band].bg,
                      )}
                    />
                  )
                })}
                {items.length > 3 && (
                  <span className="tabular text-[9px] font-bold text-graphite">
                    +{items.length - 3}
                  </span>
                )}
              </div>
            ))}

            {/* Scale labels */}
            <span className="eyebrow absolute bottom-0 left-0">Today</span>
            <span className="eyebrow absolute bottom-0 left-1/2 -translate-x-1/2">
              +7d
            </span>
            <span className="eyebrow absolute right-0 bottom-0">
              +{WINDOW_DAYS}d
            </span>
          </div>
        </div>
      </div>

      <Legend />
    </Panel>
  )
}

function Legend() {
  const items = [
    { band: 'urgent', label: 'Due in 2 days or less' },
    { band: 'soon', label: 'This week' },
    { band: 'ontrack', label: 'Further out' },
  ]

  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1.5 border-t border-rule bg-panel px-5 py-2.5">
      {items.map(({ band, label }) => (
        <span key={band} className="flex items-center gap-1.5 text-[11px] text-graphite">
          <span className={cn('size-2 rounded-sm', URGENCY_STYLES[band].bg)} aria-hidden />
          {label}
        </span>
      ))}
    </div>
  )
}
