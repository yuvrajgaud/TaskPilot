import { AlertTriangle, Clock } from 'lucide-react'
import { PriorityTicks } from '../ui/Badges'
import { Panel } from '../ui/Panel'
import { daysUntil, formatDate, relativeTime } from '../../lib/dates'

/*
  Renders one generated study plan — the payload the planner endpoint returns as
  { plan: { summary, days, warnings }, model, generatedAt }.

  The plan is a glide path in words: a per-day sequence of focused sessions
  leading up to the deadlines the Approach strip plots. It keeps the app's one
  rule — colour means time pressure and nothing else — so the day structure and
  session list are monochrome ink, priority shows as instrument ticks, and the
  single coloured element is the warnings block, where the model flags a deadline
  it couldn't fit. That's a genuine pressure signal, the kind the colour is for.
*/
export function PlanView({ plan, model, generatedAt }) {
  const { summary, days = [], warnings = [] } = plan

  return (
    <div className="space-y-5">
      <Panel className="p-5">
        <div className="flex items-start justify-between gap-4">
          <p className="eyebrow">Flight plan</p>
          {generatedAt && (
            <p className="tabular shrink-0 text-[11px] text-mute">
              {relativeTime(generatedAt)}
              {model && <span className="text-mute"> · {model}</span>}
            </p>
          )}
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-graphite">
          {summary}
        </p>
      </Panel>

      {warnings.length > 0 && (
        <div className="rounded-panel border border-urgent/30 bg-urgent-wash px-4 py-3.5">
          <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-urgent uppercase">
            <AlertTriangle className="size-3.5" strokeWidth={2} aria-hidden />
            {warnings.length === 1 ? 'One thing to watch' : "What won't fit"}
          </p>
          <ul className="mt-2 space-y-1.5">
            {warnings.map((warning, i) => (
              <li key={i} className="text-sm leading-relaxed text-urgent">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        {days.map((day) => (
          <DayCard key={day.date} day={day} />
        ))}
      </div>
    </div>
  )
}

/** One day of the plan: a dated header, then the sessions scheduled for it. */
function DayCard({ day }) {
  const { primary, secondary, tag } = dayLabel(day.date)
  const totalMinutes = (day.sessions ?? []).reduce(
    (sum, s) => sum + (s.durationMinutes ?? 0),
    0,
  )

  return (
    <Panel className="overflow-hidden">
      <div className="flex items-baseline justify-between gap-3 border-b border-rule px-4 py-3">
        <div className="flex items-baseline gap-2">
          <h3 className="text-base font-medium text-ink">{primary}</h3>
          <span className="tabular text-[11px] text-mute">{secondary}</span>
          {tag && (
            <span className="eyebrow rounded-panel border border-rule px-1.5 py-0.5">
              {tag}
            </span>
          )}
        </div>
        {totalMinutes > 0 && (
          <span className="tabular inline-flex items-center gap-1 text-[11px] font-bold text-graphite">
            <Clock className="size-3 text-mute" aria-hidden />
            {formatDuration(totalMinutes)}
          </span>
        )}
      </div>

      {day.headline && (
        <p className="px-4 pt-3 text-sm text-graphite">{day.headline}</p>
      )}

      {(day.sessions ?? []).length === 0 ? (
        <p className="px-4 py-4 text-sm text-mute">
          No sessions — a day to catch your breath.
        </p>
      ) : (
        <ul className="px-4 py-3">
          {day.sessions.map((session, i) => (
            <SessionRow key={i} session={session} />
          ))}
        </ul>
      )}
    </Panel>
  )
}

/** A single study block within a day. */
function SessionRow({ session }) {
  return (
    <li className="flex items-baseline gap-3 border-b border-rule py-2.5 last:border-0">
      <span className="tabular w-14 shrink-0 text-xs font-bold text-ink">
        {formatDuration(session.durationMinutes)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="tabular text-[11px] font-bold tracking-wide text-graphite">
            {session.courseCode}
          </span>
          <PriorityTicks priority={session.priority} />
        </div>
        <p className="mt-0.5 text-sm text-ink">{session.taskTitle}</p>
        {session.focus && (
          <p className="mt-0.5 text-xs leading-relaxed text-mute">
            {session.focus}
          </p>
        )}
      </div>
    </li>
  )
}

/** "1h 30m", "45m", "2h" — blank for a zero so empty rows stay quiet. */
function formatDuration(mins) {
  if (!mins || mins <= 0) return ''
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/*
  Turn a plan's 'YYYY-MM-DD' into a header. The date is parsed as local — not
  through new Date('YYYY-MM-DD'), which lands on UTC midnight and can slip a day
  in western timezones — so the weekday always matches the student's calendar.
*/
function dayLabel(ymd) {
  const [y, m, d] = ymd.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const days = daysUntil(date)
  return {
    primary: date.toLocaleDateString('en-GB', { weekday: 'long' }),
    secondary: formatDate(date),
    tag: days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : null,
  }
}
