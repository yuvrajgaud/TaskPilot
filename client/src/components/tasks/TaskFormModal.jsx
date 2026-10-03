import { useState } from 'react'
import { api } from '../../lib/api'
import { applyApiError } from '../../lib/formErrors'
import { Button } from '../ui/Button'
import { Field, FormError, Input, Select, Textarea } from '../ui/Form'
import { Modal } from '../ui/Modal'

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
]
const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

/** YYYY-MM-DD for a date input, from an ISO string or — with none — today. */
function toDateInput(iso) {
  const d = iso ? new Date(iso) : new Date()
  // Shift by the local offset so the input shows the calendar day the student
  // actually sees, not the UTC one.
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

/*
  Create or edit a task — one form for both. `courses` fills the course picker;
  `defaultCourseId` pre-selects one when adding from a course-scoped view. Every
  task belongs to a course, so with no courses yet the form steps aside and points
  the student to add one first.

  dueDate is the subtle bit: the API demands a full ISO 8601 timestamp, but a date
  input speaks YYYY-MM-DD — so we widen it to an ISO instant on submit and narrow
  it back for display when editing.
*/
export function TaskFormModal({
  task,
  courses,
  defaultCourseId,
  onClose,
  onSaved,
}) {
  const editing = Boolean(task)
  const [form, setForm] = useState({
    courseId: task?.courseId ?? defaultCourseId ?? courses[0]?.id ?? '',
    title: task?.title ?? '',
    status: task?.status ?? 'todo',
    priority: task?.priority ?? 'medium',
    dueDate: toDateInput(task?.dueDate),
    description: task?.description ?? '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  if (courses.length === 0) {
    return (
      <Modal title="Add task" onClose={onClose}>
        <p className="text-sm leading-relaxed text-graphite">
          Every task belongs to a course, and you haven't added one yet. Add a
          course first, then come back to track its assignments.
        </p>
        <div className="mt-6 flex justify-end">
          <Button size="sm" onClick={onClose}>
            Got it
          </Button>
        </div>
      </Modal>
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    setFormError('')
    // Guard the two fields the browser would normally block, since the form runs
    // with noValidate to keep error styling in our own hands.
    if (!form.courseId) return setErrors({ courseId: 'Choose a course.' })
    if (!form.dueDate) return setErrors({ dueDate: 'Pick a due date.' })
    setBusy(true)
    const body = {
      courseId: form.courseId,
      title: form.title.trim(),
      status: form.status,
      priority: form.priority,
      dueDate: new Date(form.dueDate).toISOString(),
      description: form.description.trim(),
    }
    try {
      const saved = editing
        ? await api.updateTask(task.id, body)
        : await api.createTask(body)
      onSaved(saved)
    } catch (err) {
      applyApiError(err, { setErrors, setFormError })
      setBusy(false)
    }
  }

  return (
    <Modal title={editing ? 'Edit task' : 'Add task'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormError>{formError}</FormError>
        <Field label="Title" htmlFor="title" error={errors.title}>
          <Input
            id="title"
            value={form.title}
            onChange={update('title')}
            invalid={Boolean(errors.title)}
            placeholder="ER diagram assignment"
            required
          />
        </Field>
        <Field label="Course" htmlFor="courseId" error={errors.courseId}>
          <Select
            id="courseId"
            value={form.courseId}
            onChange={update('courseId')}
            invalid={Boolean(errors.courseId)}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.title}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Due" htmlFor="dueDate" error={errors.dueDate}>
            <Input
              id="dueDate"
              type="date"
              value={form.dueDate}
              onChange={update('dueDate')}
              invalid={Boolean(errors.dueDate)}
              required
            />
          </Field>
          <Field label="Priority" htmlFor="priority" error={errors.priority}>
            <Select
              id="priority"
              value={form.priority}
              onChange={update('priority')}
            >
              {PRIORITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status" htmlFor="status" error={errors.status}>
            <Select id="status" value={form.status} onChange={update('status')}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field
          label="Description"
          htmlFor="description"
          error={errors.description}
          hint="Optional — the brief, so the AI planner has something to work with."
        >
          <Textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={update('description')}
            invalid={Boolean(errors.description)}
            placeholder="Model the library schema and normalise to 3NF."
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
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Add task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
