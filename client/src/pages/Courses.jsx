import { FolderOpen, Pencil, SearchX, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CourseCard } from '../components/courses/CourseCard'
import { CourseFormModal } from '../components/courses/CourseFormModal'
import { Button, IconButton } from '../components/ui/Button'
import { SearchField } from '../components/ui/Controls'
import { ConfirmDialog } from '../components/ui/Modal'
import { Panel } from '../components/ui/Panel'
import { EmptyState, ErrorState, SkeletonCard } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { api } from '../lib/api'

export function Courses() {
  const { data, error, loading, reload } = useAsync(
    () => Promise.all([api.getCourses(), api.getTasks()]),
    [],
  )
  const [query, setQuery] = useState('')
  // `editing` is null (closed), 'new' (create), or a course object (edit).
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const [courses, tasks] = data ?? [[], []]

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return courses
    return courses.filter((c) =>
      [c.code, c.title, c.instructor].some((field) =>
        field.toLowerCase().includes(q),
      ),
    )
  }, [courses, query])

  const onSaved = () => {
    setEditing(null)
    reload()
  }

  // Deleting a course cascades to its tasks server-side, so the confirm copy
  // names the count. A failed delete stays on screen with the reason rather
  // than closing silently.
  const askDelete = (course) => {
    setDeleteError('')
    setDeleting(course)
  }

  const confirmDelete = async () => {
    setDeleteBusy(true)
    setDeleteError('')
    try {
      await api.deleteCourse(deleting.id)
      setDeleting(null)
      reload()
    } catch (err) {
      setDeleteError(err.message || 'Could not delete this course. Try again.')
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Courses</p>
          <h1 className="mt-1.5 text-2xl">Your semester</h1>
        </div>
        <div className="flex items-center gap-2">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search courses"
          />
          <Button size="sm" onClick={() => setEditing('new')}>
            Add course
          </Button>
        </div>
      </header>

      {error ? (
        <Panel>
          <ErrorState error={error} onRetry={reload} />
        </Panel>
      ) : loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <Panel>
          <EmptyState
            icon={FolderOpen}
            title="No courses yet"
            hint="Add the courses you're taking this semester and TaskPilot will track their deadlines together."
            action={
              <Button size="sm" onClick={() => setEditing('new')}>
                Add your first course
              </Button>
            }
          />
        </Panel>
      ) : results.length === 0 ? (
        <Panel>
          <EmptyState
            icon={SearchX}
            title={`No course matches "${query}"`}
            hint="Try a course code, title, or instructor name."
            action={
              <Button variant="secondary" size="sm" onClick={() => setQuery('')}>
                Clear search
              </Button>
            }
          />
        </Panel>
      ) : (
        <>
          <p className="tabular text-[11px] text-mute">
            {results.length} of {courses.length} courses
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((course) => (
              <CourseGridItem
                key={course.id}
                course={course}
                tasks={tasks}
                onEdit={() => setEditing(course)}
                onDelete={() => askDelete(course)}
              />
            ))}
          </div>
        </>
      )}

      {editing && (
        <CourseFormModal
          course={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete course"
          message={deleteMessage(deleting, tasks)}
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
          busy={deleteBusy}
          error={deleteError}
        />
      )}
    </div>
  )
}

/*
  A card plus its controls. CourseCard is itself a <Link>, so edit and delete
  can't sit inside it — they ride as an absolutely-positioned sibling cluster
  that fades in on hover or keyboard focus, over the credits corner. Their
  bg-surface keeps that corner readable while they're visible.
*/
function CourseGridItem({ course, tasks, onEdit, onDelete }) {
  return (
    <div className="group relative">
      <CourseCard course={course} tasks={tasks} />
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        <IconButton
          label={`Edit ${course.code}`}
          onClick={onEdit}
          className="size-7 bg-surface"
        >
          <Pencil className="size-3.5" aria-hidden />
        </IconButton>
        <IconButton
          label={`Delete ${course.code}`}
          onClick={onDelete}
          className="size-7 bg-surface"
        >
          <Trash2 className="size-3.5" aria-hidden />
        </IconButton>
      </div>
    </div>
  )
}

function deleteMessage(course, tasks) {
  const n = tasks.filter((t) => t.courseId === course.id).length
  const head = `Delete ${course.code} — ${course.title}?`
  if (n === 0) return `${head} This can't be undone.`
  return `${head} Its ${n} task${n > 1 ? 's' : ''} will be deleted with it, and this can't be undone.`
}
