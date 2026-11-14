import { useEffect, useState } from 'react'
import Modal from './Modal.jsx'
import FormField from './FormField.jsx'
import ErrorSummary from './ErrorSummary.jsx'

/** onConfirm receives the trimmed reason; return {ok:false, errors} to keep the dialog open. */
export default function ConfirmDialog({ open = true, title = 'Confirm action', message, requireReason = false, reasonRequired = false, reasonLabel = 'Reason', confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onClose, onCancel, children }) {
  const [reason, setReason] = useState('')
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const close = onClose || onCancel
  useEffect(() => { if (open) { setReason(''); setErrors({}) } }, [open])
  async function submit(event) {
    event.preventDefault()
    if ((requireReason || reasonRequired) && !reason.trim()) { setErrors({ reason: 'Enter a reason.' }); return }
    setBusy(true)
    try {
      const result = await onConfirm?.(reason.trim())
      if (result?.ok === false) setErrors(result.errors || { form: 'The action could not be completed.' })
      else close?.()
    } catch { setErrors({ form: 'The action could not be completed. Please try again.' }) }
    finally { setBusy(false) }
  }
  return <Modal open={open} title={title} onClose={close} busy={busy}>
    <p>{message}</p><form onSubmit={submit} noValidate><ErrorSummary errors={errors} />
      {(requireReason || reasonRequired) && <FormField label={reasonLabel} as="textarea" value={reason} onChange={e => setReason(e.target.value)} error={errors.reason} required />}
      {children}<div className="actions"><button type="button" disabled={busy} onClick={close}>{cancelLabel}</button><button type="submit" className="primary" disabled={busy}>{busy ? 'Saving…' : confirmLabel}</button></div>
    </form>
  </Modal>
}
