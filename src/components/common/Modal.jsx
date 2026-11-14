import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

/** Accessible dialog: initial focus, focus trap, Esc/backdrop close, focus restoration. */
export default function Modal({ open = true, title, children, actions, onClose, large = false, busy = false }) {
  const titleId = useId()
  const dialog = useRef(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const box = dialog.current
    const focusables = () => [...box.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter(el => el.getClientRects().length)
    ;(box.querySelector('[autofocus]') || focusables()[0] || box).focus()
    const handleKey = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); if (!busy) closeRef.current?.(); return }
      if (event.key !== 'Tab') return
      const list = focusables(), first = list[0], last = list[list.length - 1]
      if (!first) { event.preventDefault(); box.focus(); return }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === box)) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === box)) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', handleKey)
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = oldOverflow; if (previous?.isConnected) previous.focus() }
  }, [open, busy])
  if (!open) return null
  return createPortal(<div className="modalback" onClick={event => { if (event.target === event.currentTarget && !busy) onClose?.() }}>
    <section ref={dialog} className={`modal ${large ? 'large' : ''}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
      <div className="modalhead"><h2 id={titleId}>{title}</h2><button type="button" aria-label="Close dialog" onClick={onClose} disabled={busy}>×</button></div>
      {children}{actions && <div className="actions">{actions}</div>}
    </section>
  </div>, document.body)
}
