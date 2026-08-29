import { FolderOpen, SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CourseCard } from '../components/courses/CourseCard'
import { Button } from '../components/ui/Button'
import { SearchField } from '../components/ui/Controls'
import { Panel } from '../components/ui/Panel'
import {
  EmptyState,
  ErrorState,
  SkeletonCard,
} from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { api } from '../lib/api'

export function Courses() {
  const { data, error, loading, reload } = useAsync(
    () => Promise.all([api.getCourses(), api.getTasks()]),
    [],
  )
  const [query, setQuery] = useState('')

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
          <Button size="sm">Add course</Button>
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
            action={<Button size="sm">Add your first course</Button>}
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
              <CourseCard key={course.id} course={course} tasks={tasks} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
