import { cn } from '../../lib/cn'
import { Panel } from '../ui/Panel'
import { Skeleton } from '../ui/States'

/**
 * A single instrument reading. The number is the loud part; the label is small
 * and quiet, the way a gauge is captioned.
 */
export function StatReadout({ value, label, suffix, tone = 'ink', loading }) {
  if (loading) {
    return (
      <Panel className="p-4">
        <Skeleton className="h-7 w-12" />
        <Skeleton className="mt-2 h-2.5 w-16" />
      </Panel>
    )
  }

  return (
    <Panel className="p-4">
      <p
        className={cn(
          'tabular text-2xl leading-none font-bold',
          tone === 'urgent' ? 'text-urgent' : 'text-ink',
        )}
      >
        {value}
        {suffix && <span className="text-base text-mute">{suffix}</span>}
      </p>
      <p className="eyebrow mt-2">{label}</p>
    </Panel>
  )
}
