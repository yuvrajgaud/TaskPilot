import { Mark } from '../ui/Mark'

/*
  The chrome for signed-out pages. No nav and no user affordances — there's
  nothing to navigate to until you're in — just the mark, the product name and a
  centered card. Deliberately a different shape from the app's Layout, so it's
  obvious at a glance which side of the door you're on.
*/
export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-panel px-4 py-10">
      <div className="mb-6 flex items-center gap-2">
        <Mark className="size-5 text-ink" />
        <span className="font-display text-base font-bold tracking-[0.16em] text-ink">
          TASKPILOT
        </span>
      </div>
      <div className="w-full max-w-sm rounded-panel border border-rule bg-surface p-6 shadow-sm">
        <h1 className="text-xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-graphite">{subtitle}</p>}
        <div className="mt-5">{children}</div>
      </div>
      {footer && <p className="mt-5 text-sm text-graphite">{footer}</p>}
    </div>
  )
}
