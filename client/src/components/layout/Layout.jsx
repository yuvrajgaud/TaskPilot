import { Navbar } from './Navbar'

export function Layout({ children }) {
  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-panel focus:bg-ink focus:px-3 focus:py-2 focus:text-sm focus:text-surface"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9">
        {children}
      </main>
    </div>
  )
}
