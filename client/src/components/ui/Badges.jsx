import { cn } from '../../lib/cn'
import { URGENCY_STYLES, dueLabel, urgencyOf } from '../../lib/dates'

const STATUS_LABEL = {
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
}

/**
 * Status is encoded by how full the glyph is — empty, half, solid — rather than
 * by hue, which keeps colour free for deadlines.
 */
export function StatusBadge({ status }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium',
        status === 'done' ? 'text-mute' : 'text-graphite',
      )}
    >
      <StatusGlyph status={status} />
      {STATUS_LABEL[status]}
    </span>
  )
}

function StatusGlyph({ status }) {
  if (status === 'done') {
    return <span className="size-2.5 rounded-full bg-ink" aria-hidden />
  }
  if (status === 'in-progress') {
    return (
      <span
        className="size-2.5 overflow-hidden rounded-full border border-ink"
        aria-hidden
      >
        <span className="block h-full w-1/2 bg-ink" />
      </span>
    )
  }
  return (
    <span className="size-2.5 rounded-full border border-graphite" aria-hidden />
  )
}

/** The only place colour appears: how much runway is left before a due date. */
export function DueBadge({ dueDate, status }) {
  const band = urgencyOf(dueDate, status)
  const style = URGENCY_STYLES[band]

  return (
    <span
      className={cn(
        'tabular inline-flex items-center rounded-panel px-1.5 py-0.5 text-[11px] font-bold',
        style.wash,
        style.text,
      )}
    >
      {dueLabel(dueDate, status)}
    </span>
  )
}

const PRIORITY_TICKS = { low: 1, medium: 2, high: 3 }

/** Priority as instrument ticks — three notches, filled to level. */
export function PriorityTicks({ priority }) {
  const filled = PRIORITY_TICKS[priority] ?? 0

  return (
    <span
      className="inline-flex items-end gap-0.5"
      title={`${priority} priority`}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            'w-0.5 rounded-full',
            i < filled ? 'bg-ink' : 'bg-rule',
          )}
          style={{ height: `${4 + i * 3}px` }}
          aria-hidden
        />
      ))}
      <span className="sr-only">{priority} priority</span>
    </span>
  )
}
