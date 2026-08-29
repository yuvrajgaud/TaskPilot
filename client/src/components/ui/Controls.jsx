import { Search, X } from 'lucide-react'
import { cn } from '../../lib/cn'

export function SearchField({ value, onChange, placeholder = 'Search' }) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-mute"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-8 w-full rounded-panel border border-rule bg-surface pr-7 pl-8 text-sm text-ink placeholder:text-mute focus:border-ink focus:outline-none sm:w-56"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 -translate-y-1/2 text-mute hover:text-ink"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      )}
    </div>
  )
}

/** Segmented filter. Counts sit in the labels so filtering feels predictable. */
export function FilterGroup({ options, value, onChange, label }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex overflow-hidden rounded-panel border border-rule bg-surface"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={cn(
            'h-8 cursor-pointer border-r border-rule px-2.5 text-xs font-medium transition-colors last:border-r-0',
            value === opt.value
              ? 'bg-ink text-surface'
              : 'text-graphite hover:bg-panel hover:text-ink',
          )}
        >
          {opt.label}
          {opt.count !== undefined && (
            <span className="tabular ml-1.5 opacity-60">{opt.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}
