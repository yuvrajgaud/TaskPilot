import { useState } from 'react'
import { api } from '../../lib/api'
import { applyApiError } from '../../lib/formErrors'
import { Button } from '../ui/Button'
import { Field, FormError, Input } from '../ui/Form'
import { Modal } from '../ui/Modal'

/*
  Edit the signed-in student's own profile. The server returns the updated user
  (initials recomputed from the name), which we hand back through onSaved so the
  nav avatar and the profile page update from the same object.
*/
export function ProfileFormModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: user.name ?? '',
    email: user.email ?? '',
    programme: user.programme ?? '',
    term: user.term ?? '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    setFormError('')
    setBusy(true)
    const body = {
      name: form.name.trim(),
      email: form.email.trim(),
      programme: form.programme.trim(),
      term: form.term.trim(),
    }
    try {
      const saved = await api.updateUser(body)
      onSaved(saved)
    } catch (err) {
      applyApiError(err, { setErrors, setFormError })
      setBusy(false)
    }
  }

  return (
    <Modal title="Edit profile" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormError>{formError}</FormError>
        <Field label="Name" htmlFor="name" error={errors.name}>
          <Input
            id="name"
            value={form.name}
            onChange={update('name')}
            invalid={Boolean(errors.name)}
            required
          />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={update('email')}
            invalid={Boolean(errors.email)}
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
        <div className="flex justify-end gap-2 pt-1">
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button size="sm" type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
