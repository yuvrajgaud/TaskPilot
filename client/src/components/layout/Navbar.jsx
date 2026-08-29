import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { currentUser } from '../../data/mockData'

const NAV = [
  { to: '/', label: 'Dashboard' },
  { to: '/courses', label: 'Courses' },
  { to: '/tasks', label: 'Tasks' },
]

/** Heading-indicator mark: a course line with the aircraft on it. */
function Mark() {
  return (
    <svg viewBox="0 0 16 16" className="size-4 text-ink" aria-hidden>
      <path d="M1 13h14" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <path
        d="M8 1.5 11.5 10H4.5L8 1.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

function navClass({ isActive }) {
  return cn(
    'relative py-1 text-sm font-medium transition-colors',
    isActive ? 'text-ink' : 'text-graphite hover:text-ink',
  )
}

export function Navbar() {
  const [open, setOpen] = useState(false)

  // Navigating away has to close the drawer, or it covers the page you just
  // asked for. Closing from the click that navigates keeps it in one place.
  const close = () => setOpen(false)

  return (
    <header className="sticky top-0 z-20 border-b border-rule bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <NavLink to="/" onClick={close} className="flex items-center gap-2">
          <Mark />
          <span className="font-display text-sm font-bold tracking-[0.16em] text-ink">
            TASKPILOT
          </span>
        </NavLink>

        <nav aria-label="Main" className="hidden items-center gap-6 sm:flex">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={navClass}>
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-[17px] left-0 h-0.5 w-full bg-ink" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <NavLink
            to="/profile"
            onClick={close}
            aria-label="Your profile"
            className={({ isActive }) =>
              cn(
                'tabular flex size-8 items-center justify-center rounded-full border text-[11px] font-bold transition-colors',
                isActive
                  ? 'border-ink bg-ink text-surface'
                  : 'border-rule text-ink hover:border-ink',
              )
            }
          >
            {currentUser.initials}
          </NavLink>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="-mr-1 p-1 text-ink sm:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          aria-label="Main"
          className="border-t border-rule bg-surface px-4 pb-3 sm:hidden"
        >
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={close}
              className={({ isActive }) =>
                cn(
                  'block border-b border-rule py-3 text-sm font-medium last:border-0',
                  isActive ? 'text-ink' : 'text-graphite',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
