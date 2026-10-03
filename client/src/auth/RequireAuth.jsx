import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { useAuth } from './useAuth'

/*
  The gate on every private route. While the first token check runs we render
  nothing — a flash of the sign-in screen before hydration finishes would be
  worse than a blank beat. Signed out, we send the visitor to /login and remember
  where they were headed, so sign-in can return them there instead of the
  dashboard. Signed in, private pages render inside the app chrome.
*/
export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return null
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}
