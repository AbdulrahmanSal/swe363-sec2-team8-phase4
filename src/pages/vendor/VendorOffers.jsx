import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { dt, fmt, fromLocalInput, toLocalInput, uid } from '../../utils/format.js'
import useToastMessage from './useToastMessage.js'
import { AccessRestricted, ConfirmDialog, EmptyState, ErrorSummary, FormField, Modal, PageHeader, StatusBadge, Toast } from './VendorUi.jsx'
import { newestFirst, offerState, validateOffer } from './vendorUtils.js'
import './vendor.css'

/** S16 · Vendor offers (VEN06, ADM08) */
export default function VendorOffers() {
  const { user, role, ownVendor } = useAuth()
  const { data, add, update, logActivity } = useData()
  const [editing, setEditing] = useState(null) // null | 'new' | offer record
  const [removing, setRemoving] = useState(null)
  const [toast, showToast] = useToastMessage()

  if (role !== 'vendor' || !ownVendor) {
    return <AccessRestricted message="Sign in with a vendor representative account to manage offers." />
  }

  const offers = data.offers.filter((f) => f.vendorId === ownVendor.id).sort(newestFirst('startAt'))

  function saveOffer(values) {
    const record = {
      title: values.title.trim(),
      description: values.description.trim(),
      startAt: values.startAt,
      endAt: values.endAt,
    }
    if (editing === 'new') add('offers', { id: uid('f'), vendorId: ownVendor.id, removed: false, removedReason: '', ...record })
    else update('offers', editing.id, record)
    logActivity(`Offer saved: ${record.title}`, user.name)
    setEditing(null)
    showToast('Offer saved. Its state follows the scheduled dates.')
  }

  function removeOffer(offer) {
    update('offers', offer.id, { removed: true, removedReason: 'Removed by vendor.' })
    logActivity(`Offer removed: ${offer.title}`, user.name)
    showToast('Offer removed from the feed and your public profile.')
  }

  return (
    <section>
      <PageHeader
        id="S16"
        screenName="Vendor offers"
        eyebrow="Business workspace"
        title="Vendor offers"
        subtitle="Describe and schedule promotions. Offers do not automatically change order prices."
        actions={
          <button type="button" className="primary" onClick={() => setEditing('new')}>
            New offer
          </button>
        }
      />

      <section className="panel">
        {offers.length ? (
          <div className="tablewrap vd-table">
            <table>
              <caption className="visuallyhidden">Offers for {ownVendor.name}</caption>
              <thead>
                <tr>
                  <th scope="col">Offer</th>
                  <th scope="col">Date range</th>
                  <th scope="col">State</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((f) => {
                  const state = offerState(f)
                  return (
                    <tr key={f.id}>
                      <td data-label="Offer">
                        <span>
                          <span className="vd-cellmain">{f.title}</span>
                          <span className="vd-cellsub">{f.description}</span>
                          {f.removed && f.removedReason && <span className="vd-reason vd-cellsub">Removal reason: {f.removedReason}</span>}
                        </span>
                      </td>
                      <td data-label="Date range" className="vd-dates">
                        <span>
                          {fmt(f.startAt)}
                          <br />
                          <span className="visuallyhidden">to </span>
                          {fmt(f.endAt)}
                        </span>
                      </td>
                      <td data-label="State">
                        <span>
                          <StatusBadge status={state} />
                        </span>
                      </td>
                      <td data-label="Actions">
                        {f.removed ? (
                          <span className="tiny muted">No actions</span>
                        ) : (
                          <div className="vd-actions">
                            <button type="button" className="small" onClick={() => setEditing(f)} aria-label={`Edit ${f.title}`}>
                              Edit
                            </button>
                            <button type="button" className="small danger" onClick={() => setRemoving(f)} aria-label={`Remove ${f.title}`}>
                              Remove
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No offers yet"
            message="Create a promotion to show it in the mall feed and on your public profile."
            action={
              <button type="button" className="primary" onClick={() => setEditing('new')}>
                New offer
              </button>
            }
          />
        )}
      </section>

      {editing && <OfferForm offer={editing === 'new' ? null : editing} onSave={saveOffer} onClose={() => setEditing(null)} />}
      {removing && (
        <ConfirmDialog
          title="Remove offer"
          message={`Remove "${removing.title}" from the mall feed and your public profile? This cannot be undone.`}
          confirmLabel="Remove offer"
          danger
          onConfirm={() => removeOffer(removing)}
          onClose={() => setRemoving(null)}
        />
      )}
      <Toast message={toast} />
    </section>
  )
}

function OfferForm({ offer, onSave, onClose }) {
  const [form, setForm] = useState({
    title: offer?.title ?? '',
    description: offer?.description ?? '',
    start: toLocalInput(offer?.startAt ?? dt(0, '09:00')),
    end: toLocalInput(offer?.endAt ?? dt(7, '22:00')),
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  function submit(e) {
    e.preventDefault()
    const values = { ...form, startAt: fromLocalInput(form.start), endAt: fromLocalInput(form.end) }
    const found = validateOffer(values)
    setErrors(found)
    if (Object.keys(found).length) return
    setSaving(true)
    onSave(values)
  }

  return (
    <Modal title={offer ? 'Edit offer' : 'New offer'} onClose={onClose} busy={saving}>
      <form onSubmit={submit} noValidate>
        <ErrorSummary errors={errors} />
        <FormField label="Offer title" value={form.title} onChange={set('title')} error={errors.title} />
        <FormField as="textarea" label="Description" value={form.description} onChange={set('description')} error={errors.description} />
        <div className="formgrid">
          <FormField label="Start date and time" type="datetime-local" value={form.start} onChange={set('start')} error={errors.startAt} />
          <FormField label="End date and time" type="datetime-local" value={form.end} onChange={set('end')} error={errors.endAt} />
        </div>
        <div className="notice">
          Times are in Asia/Riyadh. Promotions are descriptive — update any promotional item price separately in Offerings.
        </div>
        <div className="actions">
          <button type="button" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save offer'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
