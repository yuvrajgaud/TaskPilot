import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate } from '../../lib/dates'
import { DueBadge, PriorityTicks, StatusBadge } from '../ui/Badges'

/**
 * One assignment as a table-like row. Rows beat cards here: students scan a list
 * of deadlines vertically, and rows keep the due dates in a single column the
 * eye can run down. The whole row links to the assignment's detail view.
 */
export function TaskRow({ task, courseCode }) {
  return (
    <li className="border-b border-rule last:border-0">
      <Link
        to={`/tasks/${task.id}`}
        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-panel"
      >
        <PriorityTicks priority={task.priority} />

        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm ${
              task.status === 'done'
                ? 'text-mute line-through'
                : 'font-medium text-ink'
            }`}
          >
            {task.title}
          </p>
          <div className="mt-1 flex items-center gap-2.5">
            <span className="tabular text-[11px] font-bold text-graphite">
              {courseCode}
            </span>
            <StatusBadge status={task.status} />
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <DueBadge dueDate={task.dueDate} status={task.status} />
          <span className="tabular text-[10px] text-mute">
            {formatDate(task.dueDate)}
          </span>
        </div>

        <ChevronRight className="size-4 shrink-0 text-mute" aria-hidden />
      </Link>
    </li>
  )
}
