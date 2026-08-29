import { cn } from '../../lib/cn'

/**
 * Progress is ink, not colour. The reading sits beside the bar because a bar
 * alone tells you roughly, and students want exactly.
 */
export function ProgressBar({ value, total, showReading = true }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="h-1 flex-1 overflow-hidden rounded-full bg-rule"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Completion"
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-500', pct === 100 ? 'bg-ontrack' : 'bg-ink')}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showReading && (
        <span className="tabular w-9 shrink-0 text-right text-[11px] font-bold text-ink">
          {pct}%
        </span>
      )}
    </div>
  )
}
