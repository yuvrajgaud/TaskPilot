import { useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { StatReadout } from '../components/dashboard/StatReadout'
import { ProfileFormModal } from '../components/profile/ProfileFormModal'
import { Button } from '../components/ui/Button'
import { Panel, PanelHeader } from '../components/ui/Panel'
import { ErrorState, Skeleton } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { api } from '../lib/api'
import { taskStats } from '../lib/selectors'

export function Profile() {
  const { applyUser } = useAuth()
  const { data, error, loading, reload } = useAsync(
    () => Promise.all([api.getUser(), api.getCourses(), api.getTasks()]),
    [],
  )
  const [editing, setEditing] = useState(false)

  const [user, courses, tasks] = data ?? [null, [], []]
  const stats = taskStats(tasks)

  // Programme and term are optional, so join only what's set — an empty account
  // shouldn't render a stray " · ".
  const meta = user ? [user.programme, user.term].filter(Boolean).join(' · ') : ''

  // The saved user carries freshly recomputed initials. Push it into the auth
  // context so the nav avatar updates at once, then refetch this page's copy.
  const onSaved = (saved) => {
    applyUser(saved)
    setEditing(false)
    reload()
  }

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
              {meta && <p className="mt-0.5 text-xs text-mute">{meta}</p>}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditing(true)}
            >
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

      {editing && user && (
        <ProfileFormModal
          user={user}
          onClose={() => setEditing(false)}
          onSaved={onSaved}
        />
      )}
    </div>
  )
}
