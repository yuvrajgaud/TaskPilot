import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { AuthShell } from '../components/layout/AuthShell'
import { Button } from '../components/ui/Button'
import { Field, FormError, Input } from '../components/ui/Form'
import { applyApiError } from '../lib/formErrors'

/*
  Registration. Name, email and password are required; programme and term are
  optional context the planner uses to personalise a plan, so empty ones are
  dropped rather than sent as blanks. On success the new account is signed in
  straight away and dropped on the dashboard.
*/
export function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    programme: '',
    term: '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    setFormError('')
    setBusy(true)
    const body = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    }
    if (form.programme.trim()) body.programme = form.programme.trim()
    if (form.term.trim()) body.term = form.term.trim()
    try {
      await register(body)
      navigate('/', { replace: true })
    } catch (err) {
      applyApiError(err, { setErrors, setFormError })
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start tracking coursework by its deadlines, not by lists."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-ink underline underline-offset-2"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormError>{formError}</FormError>
        <Field label="Name" htmlFor="name" error={errors.name}>
          <Input
            id="name"
            autoComplete="name"
            value={form.name}
            onChange={update('name')}
            invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
            required
          />
        </Field>
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
        <Field
          label="Password"
          htmlFor="password"
          error={errors.password}
          hint="At least 8 characters."
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={update('password')}
            invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            required
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Programme" htmlFor="programme" error={errors.programme}>
            <Input
              id="programme"
              value={form.programme}
              onChange={update('programme')}
              invalid={Boolean(errors.programme)}
              placeholder="B.Tech CSE"
            />
          </Field>
          <Field label="Term" htmlFor="term" error={errors.term}>
            <Input
              id="term"
              value={form.term}
              onChange={update('term')}
              invalid={Boolean(errors.term)}
              placeholder="Semester 5"
            />
          </Field>
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  )
}
