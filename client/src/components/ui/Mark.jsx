/** Heading-indicator mark: a course line with the aircraft climbing along it. */
export function Mark({ className = 'size-4 text-ink' }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <path d="M1 13h14" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <path d="M8 1.5 11.5 10H4.5L8 1.5Z" fill="currentColor" />
    </svg>
  )
}
