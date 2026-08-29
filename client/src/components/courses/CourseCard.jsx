import { Link } from 'react-router-dom'
import { courseProgress } from '../../lib/selectors'
import { Panel } from '../ui/Panel'
import { ProgressBar } from '../ui/ProgressBar'

/**
 * One course, summarised. The card answers two questions: how far through am I,
 * and is anything overdue — in that order.
 */
export function CourseCard({ course, tasks }) {
  const { done, total, overdue, dueThisWeek } = courseProgress(course, tasks)

  return (
    <Panel
      as={Link}
      to={`/tasks?course=${course.id}`}
      className="group block p-4 transition-colors hover:border-ink"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="tabular text-[11px] font-bold tracking-wider text-graphite">
          {course.code}
        </span>
        <span className="tabular text-[11px] text-mute">
          {course.credits} cr
        </span>
      </div>

      <h3 className="mt-1.5 text-base leading-snug group-hover:underline">
        {course.title}
      </h3>
      <p className="mt-0.5 truncate text-xs text-mute">{course.instructor}</p>

      <div className="mt-4">
        <ProgressBar value={done} total={total} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
        <span className="tabular text-graphite">
          {done}/{total} done
        </span>
        {overdue > 0 && (
          <span className="tabular font-bold text-urgent">
            {overdue} overdue
          </span>
        )}
        {overdue === 0 && dueThisWeek > 0 && (
          <span className="tabular font-bold text-soon">
            {dueThisWeek} due this week
          </span>
        )}
        {overdue === 0 && dueThisWeek === 0 && (
          <span className="text-ontrack">On track</span>
        )}
      </div>
    </Panel>
  )
}
