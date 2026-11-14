/**
 * Small UI pieces used by the vendor screens (S12–S16) and S19.
 * Props follow the shared components planned in T09 (PageHeader, Modal, ConfirmDialog, FormField,
 * ErrorSummary, StatusBadge, EmptyState, Toast), so these imports can be pointed at
 * src/components/common once that folder is merged into dev.
 */
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { statusTone } from './vendorUtils.js'

/** Screen ID line, eyebrow, title, subtitle and an optional actions slot. */
export function PageHeader({ id, screenName, eyebrow, title, subtitle, actions }) {
  return (
    <header className="pagehead">
      <div>
        <div className="screenid">
          {id} / {screenName}
        </div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {subtitle && <p className="subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </header>
  )
}

/** Status written as text inside a badge — colour is only a hint (NFR07). */
export function StatusBadge({ status }) {
  return <span className={`badge ${statusTone(status)}`}>{status}</span>
}

/** Dashed box with a title, message and an optional action. */
export function EmptyState({ title, message, action }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {message && <p className="muted">{message}</p>}
      {action}
    </div>
  )
}

/** Shown when the signed-in account may not use this screen. */
export function AccessRestricted({ message }) {
  return (
    <EmptyState
      title="Access restricted"
      message={message}
      action={
        <Link className="button primary" to="/login">
          Go to login
        </Link>
      }
    />
  )
}

/** The errorbox at the top of a form, listing every field problem. */
export function ErrorSummary({ errors }) {
  const messages = Object.values(errors || {}).filter(Boolean)
  if (!messages.length) return null
  return (
    <div className="errorbox" role="alert">
      <strong>Please correct the following:</strong>
      <ul>
        {messages.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Label + input / select / textarea, with the error under it.
 * `as` = 'input' (default) | 'select' | 'textarea'. Extra props go to the control.
 */
export function FormField({ label, error, help, as = 'input', className = '', children, ...props }) {
  const id = useId()
  const Control = as
  const describedBy = [help && `${id}-help`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  return (
    <label htmlFor={id} className={className}>
      {label}
      <Control
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={error ? 'field-invalid' : undefined}
        {...props}
      >
        {children}
      </Control>
      {help && <small id={`${id}-help`}>{help}</small>}
      {error && (
        <span className="field-error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </label>
  )
}

const FOCUSABLE = 'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled)'

/** Dialog: focus moves in and is trapped, Esc and backdrop close it, focus returns afterwards. */
export function Modal({ title, children, onClose, busy = false, large = false }) {
  const titleId = useId()
  const box = useRef(null)
  const closeRef = useRef(onClose)

  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    const previous = document.activeElement
    const focusables = () => [...box.current.querySelectorAll(FOCUSABLE)]
    const first = box.current.querySelector('input, select, textarea') || focusables()[0] || box.current
    first.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (!busy) closeRef.current?.()
        return
      }
      if (e.key !== 'Tab') return
      const list = focusables()
      if (!list.length) return
      const firstEl = list[0]
      const lastEl = list[list.length - 1]
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (previous?.isConnected) previous.focus()
    }
  }, [busy])

  return createPortal(
    <div className="modalback" onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose?.()}>
      <section
        ref={box}
        className={`modal${large ? ' large' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="modalhead">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="quiet" aria-label="Close dialog" onClick={onClose} disabled={busy}>
            ×
          </button>
        </div>
        {children}
      </section>
    </div>,
    document.body,
  )
}

/**
 * Confirmation for destructive actions (remove, set closed).
 * With `requireReason`, a reason box is shown and must be filled in.
 * onConfirm(reason) runs the action; the dialog closes afterwards.
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  requireReason = false,
  reasonLabel = 'Reason',
  onConfirm,
  onClose,
}) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function submit(e) {
    e.preventDefault()
    if (requireReason && !reason.trim()) {
      setError('Enter a reason.')
      return
    }
    setBusy(true)
    onConfirm(reason.trim())
    setBusy(false)
    onClose()
  }

  return (
    <Modal title={title} onClose={onClose} busy={busy}>
      <form onSubmit={submit} noValidate>
        <p>{message}</p>
        {requireReason && (
          <FormField
            as="textarea"
            label={reasonLabel}
            value={reason}
            error={error}
            onChange={(e) => setReason(e.target.value)}
          />
        )}
        <div className="actions">
          <button type="button" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className={danger ? 'danger' : 'primary'} disabled={busy}>
            {confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  )
}

/** Short message at the bottom of the screen after a save. Announced to screen readers. */
export function Toast({ message }) {
  return (
    <div role="status" aria-live="polite">
      {message && <div className="toast">{message}</div>}
    </div>
  )
}

/** One dashboard counter box with an optional View link (S12, S15). */
export function Metric({ label, value, note, to }) {
  return (
    <div className="metric">
      <span className="muted tiny">{label}</span>
      <strong>{value}</strong>
      <span className="tiny">{note}</span>
      {to && (
        <div className="vd-metriclink">
          <Link className="button small" to={to} aria-label={`View ${label.toLowerCase()}`}>
            View →
          </Link>
        </div>
      )}
    </div>
  )
}
