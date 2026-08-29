import { ListChecks, SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TaskRow } from '../components/tasks/TaskRow'
import { Button } from '../components/ui/Button'
import { FilterGroup, SearchField } from '../components/ui/Controls'
import { Panel } from '../components/ui/Panel'
import { EmptyState, ErrorState, SkeletonRow } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { api } from '../lib/api'
import { byUrgency } from '../lib/selectors'

export function Tasks() {
  const { data, error, loading, reload } = useAsync(
    () => Promise.all([api.getCourses(), api.getTasks()]),
    [],
  )

  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')

  const [courses, tasks] = data ?? [[], []]
  const courseId = searchParams.get('course') ?? 'all'

  const codeOf = (id) => courses.find((c) => c.id === id)?.code ?? '—'

  const scoped = useMemo(
    () =>
      courseId === 'all'
        ? tasks
        : tasks.filter((t) => t.courseId === courseId),
    [tasks, courseId],
  )

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return scoped
      .filter((t) => (status === 'all' ? true : t.status === status))
      .filter((t) => (q ? t.title.toLowerCase().includes(q) : true))
      .sort(byUrgency)
  }, [scoped, status, query])

  const statusOptions = [
    { value: 'all', label: 'All', count: scoped.length },
    {
      value: 'todo',
      label: 'To do',
      count: scoped.filter((t) => t.status === 'todo').length,
    },
    {
      value: 'in-progress',
      label: 'In progress',
      count: scoped.filter((t) => t.status === 'in-progress').length,
    },
    {
      value: 'done',
      label: 'Done',
      count: scoped.filter((t) => t.status === 'done').length,
    },
  ]

  const setCourse = (id) => {
    const next = new URLSearchParams(searchParams)
    if (id === 'all') next.delete('course')
    else next.set('course', id)
    setSearchParams(next, { replace: true })
  }

  const filtersActive = query !== '' || status !== 'all' || courseId !== 'all'

  const clearFilters = () => {
    setQuery('')
    setStatus('all')
    setCourse('all')
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Tasks</p>
          <h1 className="mt-1.5 text-2xl">
            {courseId === 'all' ? 'Everything' : codeOf(courseId)}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search tasks"
          />
          <Button size="sm">Add task</Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <FilterGroup
          label="Filter by status"
          options={statusOptions}
          value={status}
          onChange={setStatus}
        />
        {!loading && courses.length > 0 && (
          <select
            value={courseId}
            onChange={(e) => setCourse(e.target.value)}
            aria-label="Filter by course"
            className="h-8 rounded-panel border border-rule bg-surface px-2 text-xs font-medium text-ink focus:border-ink focus:outline-none"
          >
            <option value="all">All courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.title}
              </option>
            ))}
          </select>
        )}
        {filtersActive && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {error ? (
        <Panel>
          <ErrorState error={error} onRetry={reload} />
        </Panel>
      ) : (
        <Panel className="overflow-hidden">
          {loading ? (
            Array.from({ length: 6 }, (_, i) => <SkeletonRow key={i} />)
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="No tasks yet"
              hint="Add an assignment and it will appear on your approach strip straight away."
              action={<Button size="sm">Add your first task</Button>}
            />
          ) : results.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Nothing matches these filters"
              hint="No task fits the current search, status, and course combination."
              action={
                <Button variant="secondary" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <ul>
              {results.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  courseCode={codeOf(task.courseId)}
                />
              ))}
            </ul>
          )}
        </Panel>
      )}

      {!loading && !error && results.length > 0 && (
        <p className="tabular text-[11px] text-mute">
          {results.length} of {tasks.length} tasks
        </p>
      )}
    </div>
  )
}
