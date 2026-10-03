import { cn } from '../../lib/cn'

/*
  Form building blocks, styled to the same monochrome system as everything else:
  ink text on the surface, a rule border that darkens to ink on focus, and no
  colour on a healthy control — an input is structure, and structure is never
  coloured. The one exception is a failed field, which borrows the urgent tone
  the rest of the app reserves for problems (matching ErrorState), so a mistake
  is impossible to miss.

  Field pairs a label with its control and shows a per-field error beneath it;
  wiring the error's id back to the control via aria-describedby keeps screen
  readers announcing it.
*/

const CONTROL =
  'w-full rounded-panel border bg-surface px-3 text-sm text-ink transition-colors placeholder:text-mute focus:outline-none disabled:opacity-50'

function borderFor(invalid) {
  return invalid ? 'border-urgent focus:border-urgent' : 'border-rule focus:border-ink'
}

export function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-ink"
      >
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-mute">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1 text-xs text-urgent">
          {error}
        </p>
      )}
    </div>
  )
}

export function Input({ invalid, className, ...rest }) {
  return (
    <input
      className={cn(CONTROL, 'h-10', borderFor(invalid), className)}
      {...rest}
    />
  )
}

export function Textarea({ invalid, className, ...rest }) {
  return (
    <textarea
      className={cn(CONTROL, 'py-2 leading-relaxed', borderFor(invalid), className)}
      {...rest}
    />
  )
}

export function Select({ invalid, className, children, ...rest }) {
  return (
    <select
      className={cn(CONTROL, 'h-10', borderFor(invalid), className)}
      {...rest}
    >
      {children}
    </select>
  )
}

/**
 * A whole-form error: the request failed, not one field. It's the one place a
 * form shows the urgent wash — a submit that didn't take is a genuine problem,
 * the kind the colour rule allows flagging.
 */
export function FormError({ children }) {
  if (!children) return null
  return (
    <p
      role="alert"
      className="rounded-panel border border-urgent/30 bg-urgent-wash px-3 py-2 text-sm text-urgent"
    >
      {children}
    </p>
  )
}
