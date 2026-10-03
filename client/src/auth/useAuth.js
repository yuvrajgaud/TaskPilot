import { useContext } from 'react'
import { AuthContext } from './context'

/** Read the auth context, failing loudly if a component forgot the provider. */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
