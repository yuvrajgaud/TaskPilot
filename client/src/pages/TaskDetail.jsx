import { ArrowLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { TaskFormModal } from '../components/tasks/TaskFormModal'
import { DueBadge, PriorityTicks, StatusBadge } from '../components/ui/Badges'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/Modal'
import { Panel, PanelHeader } from '../components/ui/Panel'
import { EmptyState, ErrorState, Skeleton } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { api } from '../lib/api'
import {
  URGENCY_STYLES,
  daysUntil,
  formatDate,
  urgencyOf,
} from '../lib/dates'
import { byUrgency } from '../lib/selectors'

const PRIORITY_LABEL = { low: 'Low', medium: 'Medium', high: 'High' }
const STATUS_LABEL = { todo: 'To do', 'in-progress': 'In progress', done: 'Done' }

/**
 * The single-assignment view. Reached by clicking any task row. It resolves the
 * task's course and the other assignments in that course, so a student can drop
 * from the list into one deadline and still see what else is coming up beside it.
 */
export function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, error, loading, reload } = useAsync(
    () => Promise.all([api.getTask(id), api.getCourses(), api.getTasks()]),
    [id],
  )
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  if (loading) return <DetailSkeleton />

  if (error) {
    // A wrong id can't be retried away, so it gets a different exit than a
    // failed request: go back to the list, don't offer a pointless retry.
    if (error.notFound) {
      return (
        <Panel className="px-6 py-16 text-center">
          <p className="eyebrow">Not found</p>
          <h1 className="mt-2 text-2xl">No such assignment</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm">
            This assignment may have been removed, or the link is wrong.
          </p>
          <Link to="/tasks" className="mt-6 inline-block">
            <Button size="sm">Back to tasks</Button>
          </Link>
        </Panel>
      )
    }
    return (
      <Panel>
        <ErrorState error={error} onRetry={reload} />
      </Panel>
    )
  }

  const [task, courses, tasks] = data
  const course = courses.find((c) => c.id === task.courseId)
  const siblings = tasks
    .filter((t) => t.courseId === task.courseId && t.id !== task.id)
    .sort(byUrgency)

  const band = urgencyOf(task.dueDate, task.status)
  const days = daysUntil(task.dueDate)
  const done = task.status === 'done'

  // Mark done / reopen is a single-field status flip; a failure surfaces inline
  // beneath the actions rather than replacing the whole view.
  const toggleDone = async () => {
    setBusy(true)
    setActionError('')
    try {
      await api.updateTask(task.id, { status: done ? 'todo' : 'done' })
      reload()
    } catch (err) {
      setActionError(err.message || 'Could not update this task. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const onSaved = () => {
    setEditing(false)
    reload()
  }

  // A delete here leaves nothing to show, so on success we return to the list.
  const confirmDelete = async () => {
    setDeleteBusy(true)
    setDeleteError('')
    try {
      await api.deleteTask(task.id)
      navigate('/tasks')
    } catch (err) {
      setDeleteError(err.message || 'Could not delete this task. Try again.')
      setDeleteBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <Link
        to={course ? `/tasks?course=${course.id}` : '/tasks'}
        className="inline-flex items-center gap-1.5 text-sm text-graphite transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {course ? `${course.code} tasks` : 'All tasks'}
      </Link>

      <Panel className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow">
              {course ? `${course.code} · ${course.title}` : 'Assignment'}
            </p>
            <h1 className="mt-2 text-2xl leading-snug">{task.title}</h1>
          </div>
          <PriorityTicks priority={task.priority} />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <DueBadge dueDate={task.dueDate} status={task.status} />
          <StatusBadge status={task.status} />
        </div>

        {task.description && (
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-graphite">
            {task.description}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <Button size="sm" onClick={toggleDone} disabled={busy}>
            {busy ? 'Saving…' : done ? 'Reopen' : 'Mark as done'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setEditing(true)}
            disabled={busy}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDeleteError('')
              setDeleting(true)
            }}
            disabled={busy}
          >
            Delete
          </Button>
        </div>
        {actionError && (
          <p role="alert" className="mt-3 text-sm text-urgent">
            {actionError}
          </p>
        )}
      </Panel>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Readout label="Due date" value={formatDate(task.dueDate)} />
        <Readout
          label="Time left"
          value={timeLeft(days, task.status)}
          tone={band}
        />
        <Readout label="Priority" value={PRIORITY_LABEL[task.priority]} />
        <Readout label="Status" value={STATUS_LABEL[task.status]} />
      </div>

      {course && (
        <section>
          <PanelHeader
            eyebrow="Same course"
            title={`More in ${course.code}`}
            action={
              <Link to={`/tasks?course=${course.id}`}>
                <Button variant="ghost" size="sm">
                  View all
                </Button>
              </Link>
            }
          />
          <Panel className="overflow-hidden">
            {siblings.length === 0 ? (
              <EmptyState
                title="Nothing else here"
                hint={`This is the only assignment tracked for ${course.title}.`}
              />
            ) : (
              <ul>
                {siblings.map((t) => (
                  <li key={t.id} className="border-b border-rule last:border-0">
                    <Link
                      to={`/tasks/${t.id}`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-panel"
                    >
                      <span
                        className={`truncate text-sm ${
                          t.status === 'done'
                            ? 'text-mute line-through'
                            : 'text-ink'
                        }`}
                      >
                        {t.title}
                      </span>
                      <span className="ml-auto shrink-0">
                        <DueBadge dueDate={t.dueDate} status={t.status} />
                      </span>
                      <ChevronRight
                        className="size-4 shrink-0 text-mute"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </section>
      )}

      {editing && (
        <TaskFormModal
          task={task}
          courses={courses}
          onClose={() => setEditing(false)}
          onSaved={onSaved}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete task"
          message={`Delete "${task.title}"? This can't be undone.`}
          onConfirm={confirmDelete}
          onClose={() => setDeleting(false)}
          busy={deleteBusy}
          error={deleteError}
        />
      )}
    </div>
  )
}

/** One labelled reading. Only "Time left" carries colour — the time-pressure rule. */
function Readout({ label, value, tone }) {
  const color = tone ? URGENCY_STYLES[tone].text : 'text-ink'
  return (
    <Panel className="p-3.5">
      <p className="eyebrow">{label}</p>
      <p className={`tabular mt-1.5 text-lg font-medium ${color}`}>{value}</p>
    </Panel>
  )
}

function timeLeft(days, status) {
  if (status === 'done') return 'Done'
  if (days < 0) return `${Math.abs(days)}d over`
  if (days === 0) return 'Today'
  if (days === 1) return '1 day'
  return `${days} days`
}

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-4 w-24" />
      <Panel className="p-6">
        <Skeleton className="h-3 w-44" />
        <Skeleton className="mt-3 h-6 w-2/3" />
        <div className="mt-5 flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="mt-5 h-14 w-full" />
      </Panel>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Panel key={i} className="p-3.5">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="mt-2 h-5 w-16" />
          </Panel>
        ))}
      </div>
    </div>
  )
}
