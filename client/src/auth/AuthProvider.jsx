import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, getToken, setToken } from '../lib/api'
import { AuthContext } from './context'

/*
  Owns the answer to "who is signed in". On mount, if a token survived in
  localStorage we confirm it by fetching the current user; a 401 means the token
  is stale, so we drop it and let the guard land the visitor on sign-in. Holding
  the user in React state — rather than re-reading storage in every component —
  keeps the nav, the route guard and the pages in sync from one source of truth.
*/
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Only block first paint on a hydrate if there's actually a token to check;
  // a fresh visitor should see the sign-in screen immediately.
  const [loading, setLoading] = useState(() => Boolean(getToken()))

  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    api
      .getUser()
      .then((u) => {
        if (!cancelled) setUser(u)
      })
      .catch((err) => {
        // A stale/invalid token is the expected failure; clear it so the guard
        // redirects to sign-in. A transient network error also lands there,
        // which is the safe default — but we keep the token so a later reload
        // can retry rather than forcing a needless re-login.
        if (cancelled) return
        if (err.unauthorized) setToken(null)
        setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const { user: u, token } = await api.login(credentials)
    setToken(token)
    setUser(u)
    return u
  }, [])

  const register = useCallback(async (details) => {
    const { user: u, token } = await api.register(details)
    setToken(token)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    api.logout()
    setUser(null)
  }, [])

  // After a profile edit the server returns the updated user; swap it in without
  // another round-trip so the nav initials and profile update at once.
  const applyUser = useCallback((u) => setUser(u), [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout, applyUser }),
    [user, loading, login, register, logout, applyUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
