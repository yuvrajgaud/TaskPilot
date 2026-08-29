import { AlertTriangle, RotateCw } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Button } from './Button'
import { Panel } from './Panel'

/** Grey block placeholder. Matches the shape of what's loading, not a spinner. */
export function Skeleton({ className }) {
  return (
    <div
      className={cn('animate-pulse rounded bg-rule', className)}
      aria-hidden
    />
  )
}

/** Card-shaped skeleton, used while course and task lists load. */
export function SkeletonCard() {
  return (
    <Panel className="p-4">
      <Skeleton className="h-3 w-12" />
      <Skeleton className="mt-2.5 h-4 w-3/4" />
      <Skeleton className="mt-4 h-1 w-full" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>
    </Panel>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 border-b border-rule px-4 py-3 last:border-0">
      <Skeleton className="size-2.5 rounded-full" />
      <Skeleton className="h-3.5 flex-1" />
      <Skeleton className="h-4 w-14" />
    </div>
  )
}

/**
 * Empty screens are an invitation, so each one names the action that fills it.
 * `hint` explains the difference between "you have nothing" and "nothing matched
 * your filter" — they need different responses from the user.
 */
export function EmptyState({ icon: Icon, title, hint, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {Icon && (
        <div className="mb-4 flex size-10 items-center justify-center rounded-panel border border-rule bg-panel">
          <Icon className="size-4 text-mute" strokeWidth={1.75} aria-hidden />
        </div>
      )}
      <h3 className="text-base">{title}</h3>
      {hint && <p className="mt-1.5 max-w-xs text-sm text-graphite">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/**
 * Errors say what failed and offer the fix. No apology, no vague "oops" —
 * a retry button is more useful than a sad face.
 */
export function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex size-10 items-center justify-center rounded-panel border border-urgent/30 bg-urgent-wash">
        <AlertTriangle
          className="size-4 text-urgent"
          strokeWidth={1.75}
          aria-hidden
        />
      </div>
      <h3 className="text-base">Couldn't load this</h3>
      <p className="mt-1.5 max-w-sm text-sm text-graphite">
        {error?.message ?? 'The request failed before it returned any data.'}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          <RotateCw className="size-3.5" aria-hidden />
          Try again
        </Button>
      )}
    </div>
  )
}
