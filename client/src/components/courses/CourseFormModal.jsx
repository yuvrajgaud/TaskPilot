import { useState } from 'react'
import { api } from '../../lib/api'
import { applyApiError } from '../../lib/formErrors'
import { Button } from '../ui/Button'
import { Field, FormError, Input } from '../ui/Form'
import { Modal } from '../ui/Modal'

/*
  Create or edit a course — one form does both. Pass a `course` to edit it, omit
  it to create. On success the saved course is handed back through onSaved so the
  list updates without a full refetch. credits is sent as a number because the
  API validates it as an integer 1–10, and an <input> hands back a string.
*/
export function CourseFormModal({ course, onClose, onSaved }) {
  const editing = Boolean(course)
  const [form, setForm] = useState({
    code: course?.code ?? '',
    title: course?.title ?? '',
    instructor: course?.instructor ?? '',
    credits: course?.credits != null ? String(course.credits) : '3',
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
      code: form.code.trim(),
      title: form.title.trim(),
      instructor: form.instructor.trim(),
      credits: Number(form.credits),
    }
    try {
      const saved = editing
        ? await api.updateCourse(course.id, body)
        : await api.createCourse(body)
      onSaved(saved)
    } catch (err) {
      applyApiError(err, { setErrors, setFormError })
      setBusy(false)
    }
  }

  return (
    <Modal title={editing ? 'Edit course' : 'Add course'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormError>{formError}</FormError>
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <Field label="Code" htmlFor="code" error={errors.code}>
            <Input
              id="code"
              value={form.code}
              onChange={update('code')}
              invalid={Boolean(errors.code)}
              placeholder="CS301"
              required
            />
          </Field>
          <Field label="Credits" htmlFor="credits" error={errors.credits}>
            <Input
              id="credits"
              type="number"
              min="1"
              max="10"
              value={form.credits}
              onChange={update('credits')}
              invalid={Boolean(errors.credits)}
              className="w-24"
              required
            />
          </Field>
        </div>
        <Field label="Title" htmlFor="title" error={errors.title}>
          <Input
            id="title"
            value={form.title}
            onChange={update('title')}
            invalid={Boolean(errors.title)}
            placeholder="Database Management Systems"
            required
          />
        </Field>
        <Field label="Instructor" htmlFor="instructor" error={errors.instructor}>
          <Input
            id="instructor"
            value={form.instructor}
            onChange={update('instructor')}
            invalid={Boolean(errors.instructor)}
            placeholder="Dr. Menon"
            required
          />
        </Field>
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
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Add course'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
