import { useCallback, useEffect, useState } from 'react'

/**
 * Runs an async function and tracks its lifecycle so pages don't each reinvent
 * loading/error bookkeeping.
 *
 * Returns { data, error, loading, reload }. `reload` lets an error state offer a
 * genuine retry instead of asking the user to refresh the page.
 */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({
    data: null,
    error: null,
    loading: true,
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps)

  const load = useCallback(() => {
    let cancelled = false
    setState({ data: null, error: null, loading: true })

    run()
      .then((data) => {
        if (!cancelled) setState({ data, error: null, loading: false })
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, error, loading: false })
      })

    return () => {
      cancelled = true
    }
  }, [run])

  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => load(), [load, reloadKey])

  return { ...state, reload: () => setReloadKey((k) => k + 1) }
}
