import { createContext } from 'react'

/*
  The auth context holds the signed-in user and the actions that change who is
  signed in. It lives in its own module so the provider component and the useAuth
  hook can share it without a circular import — and so the context object is
  created exactly once, not on every render.
*/
export const AuthContext = createContext(null)
