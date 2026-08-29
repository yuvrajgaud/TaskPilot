import { CalendarClock, FolderOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ApproachStrip } from '../components/dashboard/ApproachStrip'
import { StatReadout } from '../components/dashboard/StatReadout'
import { CourseCard } from '../components/courses/CourseCard'
import { TaskRow } from '../components/tasks/TaskRow'
import { Button } from '../components/ui/Button'
import { Panel, PanelHeader } from '../components/ui/Panel'
import {
  EmptyState,
  ErrorState,
  SkeletonCard,
  SkeletonRow,
} from '../components/ui/States'
import { currentUser } from '../data/mockData'
import { useAsync } from '../hooks/useAsync'
import { api } from '../lib/api'
import { byUrgency } from '../lib/selectors'
import { taskStats } from '../lib/selectors'

const DUE_NEXT_LIMIT = 6

export function Dashboard() {
  const { data, error, loading, reload } = useAsync(
    () => Promise.all([api.getCourses(), api.getTasks(), api.getActivity()]),
    [],
  )

  const [courses, tasks, activity] = data ?? [[], [], []]
  const stats = taskStats(tasks)

  const dueNext = [...tasks]
    .filter((t) => t.status !== 'done')
    .sort(byUrgency)
    .slice(0, DUE_NEXT_LIMIT)

  const codeOf = (courseId) =>
    courses.find((c) => c.id === courseId)?.code ?? '—'

  if (error) {
    return (
      <Panel>
        <ErrorState error={error} onRetry={reload} />
      </Panel>
    )
  }

  return (
    <div className="space-y-7">
      <header>
        <p className="eyebrow">{currentUser.term}</p>
        <h1 className="mt-1.5 text-2xl sm:text-[28px]">
          {greeting()}, {currentUser.name.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm">{summaryLine(stats, loading)}</p>
      </header>

      <ApproachStrip tasks={tasks} courses={courses} loading={loading} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatReadout loading={loading} value={stats.open} label="Open tasks" />
        <StatReadout
          loading={loading}
          value={stats.dueThisWeek}
          label="Due this week"
        />
        <StatReadout
          loading={loading}
          value={stats.overdue}
          label="Overdue"
          tone={stats.overdue > 0 ? 'urgent' : 'ink'}
        />
        <StatReadout
          loading={loading}
          value={stats.completionPct}
          suffix="%"
          label="Completed"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <PanelHeader
            eyebrow="Due next"
            title="What to work on"
            action={
              <Link to="/tasks">
                <Button variant="ghost" size="sm">
                  All tasks
                </Button>
              </Link>
            }
          />
          <Panel className="overflow-hidden">
            {loading ? (
              Array.from({ length: 4 }, (_, i) => <SkeletonRow key={i} />)
            ) : dueNext.length === 0 ? (
              /* "nothing tracked" and "all caught up" need different copy —
                 one asks for input, the other confirms you're clear. */
              <EmptyState
                icon={CalendarClock}
                title={
                  tasks.length === 0 ? 'No tasks tracked' : 'Nothing outstanding'
                }
                hint={
                  tasks.length === 0
                    ? 'Add an assignment and it will appear here and on the approach strip.'
                    : 'Every task is done. Add the next assignment when it lands.'
                }
                action={
                  tasks.length === 0 ? (
                    <Button size="sm">Add a task</Button>
                  ) : undefined
                }
              />
            ) : (
              <ul>
                {dueNext.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    courseCode={codeOf(task.courseId)}
                  />
                ))}
              </ul>
            )}
          </Panel>
        </section>

        <section>
          <PanelHeader eyebrow="Log" title="Recent activity" />
          <Panel className="overflow-hidden">
            {loading ? (
              Array.from({ length: 4 }, (_, i) => <SkeletonRow key={i} />)
            ) : activity.length === 0 ? (
              <EmptyState
                title="No activity yet"
                hint="Changes you make to courses and tasks show up here."
              />
            ) : (
              <ul>
                {activity.map((item) => (
                  <li
                    key={item.id}
                    className="border-b border-rule px-4 py-3 last:border-0"
                  >
                    <p className="text-sm text-ink">{item.text}</p>
                    <p className="tabular mt-0.5 text-[10px] text-mute uppercase">
                      {item.at}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </section>
      </div>

      <section>
        <PanelHeader
          eyebrow="Courses"
          title="This semester"
          action={
            <Link to="/courses">
              <Button variant="ghost" size="sm">
                Manage
              </Button>
            </Link>
          }
        />
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <Panel>
            <EmptyState
              icon={FolderOpen}
              title="No courses yet"
              hint="Add your first course and TaskPilot will start plotting its deadlines."
              action={<Button size="sm">Add a course</Button>}
            />
          </Panel>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} tasks={tasks} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function summaryLine(stats, loading) {
  if (loading) return 'Reading your semester…'
  if (stats.total === 0) return 'Nothing tracked yet — add a course to begin.'
  if (stats.overdue > 0) {
    return `${stats.overdue} task${stats.overdue > 1 ? 's' : ''} overdue, and ${stats.dueThisWeek} due in the next seven days.`
  }
  if (stats.dueThisWeek > 0) {
    return `${stats.dueThisWeek} task${stats.dueThisWeek > 1 ? 's' : ''} due in the next seven days. Nothing overdue.`
  }
  return 'Nothing due this week. Good time to get ahead.'
}
