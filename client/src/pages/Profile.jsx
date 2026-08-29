import { StatReadout } from '../components/dashboard/StatReadout'
import { Panel, PanelHeader } from '../components/ui/Panel'
import { Button } from '../components/ui/Button'
import { ErrorState } from '../components/ui/States'
import { Skeleton } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { api } from '../lib/api'
import { taskStats } from '../lib/selectors'

export function Profile() {
  const { data, error, loading, reload } = useAsync(
    () => Promise.all([api.getUser(), api.getCourses(), api.getTasks()]),
    [],
  )

  const [user, courses, tasks] = data ?? [null, [], []]
  const stats = taskStats(tasks)

  if (error) {
    return (
      <Panel>
        <ErrorState error={error} onRetry={reload} />
      </Panel>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Profile</p>
        <h1 className="mt-1.5 text-2xl">Your account</h1>
      </header>

      <Panel className="p-5">
        {loading ? (
          <div className="flex items-center gap-4">
            <Skeleton className="size-14 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-2 h-3 w-56" />
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <div className="tabular flex size-14 shrink-0 items-center justify-center rounded-full border border-ink text-base font-bold text-ink">
              {user.initials}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg">{user.name}</h2>
              <p className="truncate text-sm">{user.email}</p>
              <p className="mt-0.5 text-xs text-mute">
                {user.programme} · {user.term}
              </p>
            </div>
            <Button variant="secondary" size="sm">
              Edit profile
            </Button>
          </div>
        )}
      </Panel>

      <section>
        <PanelHeader eyebrow="Summary" title="This semester at a glance" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatReadout
            loading={loading}
            value={courses.length}
            label="Courses"
          />
          <StatReadout loading={loading} value={stats.total} label="Tasks" />
          <StatReadout loading={loading} value={stats.done} label="Completed" />
          <StatReadout
            loading={loading}
            value={stats.completionPct}
            suffix="%"
            label="Progress"
          />
        </div>
      </section>

      <Panel className="p-5">
        <p className="eyebrow mb-2">Note</p>
        <p className="text-sm">
          Accounts are read-only in Task 1 — the profile is rendered from mock
          data. Registration, login and protected routes arrive in Task 4, once
          the API and database layers are in place.
        </p>
      </Panel>
    </div>
  )
}
