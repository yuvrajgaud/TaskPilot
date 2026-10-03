import { X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button, IconButton } from './Button'

/*
  A modal dialog rendered through a portal so it escapes any transformed or
  overflow-clipped ancestor and always covers the viewport. Escape and a
  backdrop click are the two exits people reach for first; while it's open the
  body can't scroll behind it. Colour stays out of the chrome — a dialog is
  structure. The panel is scrollable-tall content friendly: it sits near the top
  and the backdrop itself scrolls on short viewports.
*/
export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 pt-[8vh] backdrop-blur-sm"
      onMouseDown={(e) => {
        // Only a click that both starts and ends on the backdrop closes — a drag
        // that begins inside the panel and releases outside must not.
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-lg rounded-panel border border-rule bg-surface shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-rule px-5 py-3.5">
          <h2 className="text-base font-medium text-ink">{title}</h2>
          <IconButton label="Close" onClick={onClose} className="size-8 border-0">
            <X className="size-4" />
          </IconButton>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

/*
  Confirmation for a destructive action — deleting a course or a task. The
  confirm button carries no colour: the weight of the choice is in the copy, not
  a red button, because colour still means deadline pressure and nothing else.
  `busy` disables both actions while the delete is in flight; `error` surfaces a
  failure in place so a delete that didn't take isn't silently dismissed.
*/
export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onClose,
  busy,
  error,
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-sm leading-relaxed text-graphite">{message}</p>
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-panel border border-urgent/30 bg-urgent-wash px-3 py-2 text-sm text-urgent"
        >
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button size="sm" onClick={onConfirm} disabled={busy}>
          {busy ? 'Working…' : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
