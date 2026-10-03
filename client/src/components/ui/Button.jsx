import { cn } from '../../lib/cn'

const VARIANTS = {
  primary: 'bg-ink text-surface hover:bg-graphite',
  secondary: 'border border-rule bg-surface text-ink hover:border-ink',
  ghost: 'text-graphite hover:bg-panel hover:text-ink',
}

const SIZES = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
}

/**
 * Buttons stay monochrome on purpose — colour in TaskPilot means "this deadline
 * needs attention", so spending it on a Save button would dilute the signal.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}) {
  return (
    <button
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-panel font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

/**
 * A square, icon-only button for row actions and dialog controls. Same
 * monochrome rule as Button — an icon action is structure, not urgency — and it
 * always carries an accessible label, since the icon alone names nothing.
 */
export function IconButton({ label, className, children, ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'inline-flex size-8 cursor-pointer items-center justify-center rounded-panel border border-rule bg-surface text-graphite transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-40',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
