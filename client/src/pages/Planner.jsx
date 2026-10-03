import { Sparkles, Wand2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlanView } from '../components/planner/PlanView'
import { Button } from '../components/ui/Button'
import { Field, Input, Select, Textarea } from '../components/ui/Form'
import { Mark } from '../components/ui/Mark'
import { Panel } from '../components/ui/Panel'
import { EmptyState, ErrorState, Skeleton } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { api } from '../lib/api'

const HORIZON_OPTIONS = [
  { value: '3', label: 'Next 3 days' },
  { value: '7', label: 'Next week' },
  { value: '14', label: 'Next 2 weeks' },
  { value: '30', label: 'Next month' },
]

/*
  The flagship: hand the deadlines to the model and get back a day-by-day study
  plan. It plans around unfinished tasks only, so the page gates on that first —
  with nothing pending there's nothing to plan, and it says so rather than letting
  a generate attempt bounce off the API's own 400.

  Generation is a real network round-trip to the model and takes a beat, so the
  wait gets a proper, reassuring state rather than a spinner — see GeneratingState.
*/
export function Planner() {
  // Load tasks purely to know whether there's anything to plan around.
  const { data: tasks, error: loadError, loading, reload } = useAsync(
    () => api.getTasks(),
    [],
  )
  const pending = (tasks ?? []).filter((t) => t.status !== 'done')

  const [horizonDays, setHorizonDays] = useState('7')
  const [hoursPerDay, setHoursPerDay] = useState('')
  const [focus, setFocus] = useState('')

  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [generating, setGenerating] = useState(false)

  const generate = useCallback(async () => {
    setError(null)
    setGenerating(true)
    const body = { horizonDays: Number(horizonDays) }
    if (hoursPerDay.trim()) body.hoursPerDay = Number(hoursPerDay)
    if (focus.trim()) body.focus = focus.trim()
    try {
      setResult(await api.generatePlan(body))
    } catch (err) {
      setError(err)
    } finally {
      setGenerating(false)
    }
  }, [horizonDays, hoursPerDay, focus])

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">Planner</p>
        <h1 className="mt-1.5 text-2xl">Plan your week</h1>
        <p className="mt-1 max-w-2xl text-sm text-graphite">
          TaskPilot reads your open assignments — their deadlines and priorities —
          and maps out focused study sessions across the days ahead.
        </p>
      </header>

      {loadError ? (
        <Panel>
          <ErrorState error={loadError} onRetry={reload} />
        </Panel>
      ) : loading ? (
        <Panel className="p-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-10 w-full" />
          <Skeleton className="mt-3 h-10 w-full" />
        </Panel>
      ) : pending.length === 0 ? (
        <Panel>
          <EmptyState
            icon={Sparkles}
            title="Nothing to plan yet"
            hint="Add an assignment with a due date and the planner will map out how to approach it."
            action={
              <Link to="/tasks">
                <Button size="sm">Add a task</Button>
              </Link>
            }
          />
        </Panel>
      ) : (
        <>
          <Panel className="p-5">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                generate()
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Plan across"
                  htmlFor="horizonDays"
                  hint={`Planning around ${pending.length} open task${
                    pending.length > 1 ? 's' : ''
                  }.`}
                >
                  <Select
                    id="horizonDays"
                    value={horizonDays}
                    onChange={(e) => setHorizonDays(e.target.value)}
                    disabled={generating}
                  >
                    {HORIZON_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field
                  label="Hours a day"
                  htmlFor="hoursPerDay"
                  hint="Optional — how much time you can give it."
                >
                  <Input
                    id="hoursPerDay"
                    type="number"
                    min="0.5"
                    max="16"
                    step="0.5"
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(e.target.value)}
                    placeholder="e.g. 3"
                    disabled={generating}
                  />
                </Field>
              </div>
              <Field
                label="Anything to focus on?"
                htmlFor="focus"
                hint="Optional — an exam, a weak spot, a day you're away."
              >
                <Textarea
                  id="focus"
                  rows={2}
                  maxLength={500}
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="e.g. My database exam is on the 30th — weight it heavily."
                  disabled={generating}
                />
              </Field>
              <div className="flex justify-end">
                <Button type="submit" disabled={generating}>
                  <Wand2 className="size-4" aria-hidden />
                  {generating
                    ? 'Planning…'
                    : result
                      ? 'Regenerate plan'
                      : 'Generate plan'}
                </Button>
              </div>
            </form>
          </Panel>

          {generating ? (
            <GeneratingState />
          ) : error ? (
            <PlanError error={error} onRetry={generate} />
          ) : result ? (
            <PlanView
              plan={result.plan}
              model={result.model}
              generatedAt={result.generatedAt}
            />
          ) : null}
        </>
      )}
    </div>
  )
}

/*
  Generation runs against the model and takes several seconds, so the wait is a
  first-class state, not a spinner: it says what's happening and roughly how long,
  so a slow response reads as work in progress rather than a hang.
*/
function GeneratingState() {
  return (
    <Panel className="flex flex-col items-center px-6 py-14 text-center">
      <div className="flex size-11 items-center justify-center rounded-panel border border-rule bg-panel">
        <Mark className="size-5 animate-pulse text-ink" />
      </div>
      <h3 className="mt-4 text-base">Plotting your route…</h3>
      <p className="mt-1.5 max-w-sm text-sm text-graphite">
        The planner is weighing your deadlines, priorities and the hours you have.
        This usually takes a few seconds.
      </p>
      <div className="mt-5 flex gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-pulse rounded-full bg-graphite"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </Panel>
  )
}

/*
  Planner failures split two ways. A 503 means the service isn't configured (no
  model key) — a retry won't help, so it doesn't offer one. Everything else is a
  genuine transient failure the student can retry, which re-runs generation with
  the same inputs.
*/
function PlanError({ error, onRetry }) {
  if (error.status === 503) {
    return (
      <Panel className="px-6 py-12 text-center">
        <p className="eyebrow">Planner offline</p>
        <h3 className="mt-2 text-base">The AI planner isn't available right now</h3>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-graphite">
          {error.message ??
            'The planning service is not configured. Your tasks and courses are unaffected.'}
        </p>
      </Panel>
    )
  }
  return (
    <Panel>
      <ErrorState error={error} onRetry={onRetry} />
    </Panel>
  )
}
