import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { AuthShell } from '../components/layout/AuthShell'
import { Button } from '../components/ui/Button'
import { Field, FormError, Input } from '../components/ui/Form'
import { applyApiError } from '../lib/formErrors'

/*
  Sign-in. On success we return the visitor to wherever RequireAuth intercepted
  them (the `from` in location state), defaulting to the dashboard. A wrong email
  or password comes back as a single form-level line — the server won't say which
  was wrong, which is deliberate: it avoids revealing whether an email exists.
*/
export function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname ?? '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  // Already signed in (opened /login directly)? Don't show the form.
  if (user) return <Navigate to={from} replace />

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    setFormError('')
    setBusy(true)
    try {
      await login(form)
      navigate(from, { replace: true })
    } catch (err) {
      applyApiError(err, { setErrors, setFormError })
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back. Your deadlines are where you left them."
      footer={
        <>
          New here?{' '}
          <Link
            to="/register"
            className="font-medium text-ink underline underline-offset-2"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormError>{formError}</FormError>
        <Field label="Email" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={update('email')}
            invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            required
          />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={update('password')}
            invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            required
          />
        </Field>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthShell>
  )
}
