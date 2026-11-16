import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { money, uid } from '../../utils/format.js'
import useToastMessage from './useToastMessage.js'
import { AccessRestricted, ConfirmDialog, EmptyState, ErrorSummary, FormField, Modal, PageHeader, StatusBadge, Toast } from './VendorUi.jsx'
import { validateOffering } from './vendorUtils.js'
import './vendor.css'

/** S14 · Offerings manager (VEN04) */
export default function Offerings() {
  const { user, role, ownVendor } = useAuth()
  const { data, add, update, logActivity } = useData()
  const [editing, setEditing] = useState(null) // null | 'new' | offering record
  const [removing, setRemoving] = useState(null)
  const [toast, showToast] = useToastMessage()

  if (role !== 'vendor' || !ownVendor) {
    return <AccessRestricted message="Sign in with a vendor representative account to manage offerings." />
  }

  const offerings = data.offerings.filter((o) => o.vendorId === ownVendor.id && !o.removed)

  function toggleAvailable(o) {
    update('offerings', o.id, { available: !o.available })
    logActivity(`Availability updated for ${o.name}`, user.name)
    showToast(`${o.name} is now ${o.available ? 'unavailable' : 'available'}.`)
  }

  function removeOffering(o) {
    // Kept with a removed flag so past orders and bookings still show what was requested.
    update('offerings', o.id, { removed: true, available: false })
    logActivity(`Offering removed: ${o.name}`, user.name)
    showToast('Offering removed. Existing request history is unchanged.')
  }

  function saveOffering(values) {
    const record = {
      name: values.name.trim(),
      description: values.description.trim(),
      price: String(values.price).trim() === '' ? null : Math.round(Number(values.price) * 100) / 100,
      available: values.available,
    }
    if (editing === 'new') add('offerings', { id: uid('o'), vendorId: ownVendor.id, removed: false, ...record })
    else update('offerings', editing.id, record)
    logActivity(`Offering saved: ${record.name}`, user.name)
    setEditing(null)
    showToast('Offering saved.')
  }

  return (
    <section>
      <PageHeader
        id="S14"
        screenName="Offerings manager"
        eyebrow="Business workspace"
        title="Offerings"
        subtitle={`${ownVendor.name} · Manage products and services. Submitted requests keep their original details.`}
        actions={
          <button type="button" className="primary" onClick={() => setEditing('new')}>
            Add offering
          </button>
        }
      />

      <section className="panel">
        {offerings.length ? (
          <div className="tablewrap vd-table">
            <table>
              <caption className="visuallyhidden">Offerings for {ownVendor.name}</caption>
              <thead>
                <tr>
                  <th scope="col">Offering</th>
                  <th scope="col">Price</th>
                  <th scope="col">Availability</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {offerings.map((o) => (
                  <tr key={o.id}>
                    <td data-label="Offering">
                      <span>
                        <span className="vd-cellmain">{o.name}</span>
                        <span className="vd-cellsub">{o.description}</span>
                      </span>
                    </td>
                    <td data-label="Price">{o.price == null ? 'Quote offline' : money(o.price)}</td>
                    <td data-label="Availability">
                      <span>
                        <StatusBadge status={o.available ? 'Available' : 'Unavailable'} />
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div className="vd-actions">
                        <button type="button" className="small" onClick={() => setEditing(o)} aria-label={`Edit ${o.name}`}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="small"
                          onClick={() => toggleAvailable(o)}
                          aria-label={`${o.available ? 'Mark unavailable' : 'Make available'}: ${o.name}`}
                        >
                          {o.available ? 'Mark unavailable' : 'Make available'}
                        </button>
                        <button type="button" className="small danger" onClick={() => setRemoving(o)} aria-label={`Remove ${o.name}`}>
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No offerings yet"
            message="Add the products or services customers can order or book."
            action={
              <button type="button" className="primary" onClick={() => setEditing('new')}>
                Add offering
              </button>
            }
          />
        )}
      </section>

      {editing && (
        <OfferingForm
          offering={editing === 'new' ? null : editing}
          vendorType={ownVendor.type}
          onSave={saveOffering}
          onClose={() => setEditing(null)}
        />
      )}
      {removing && (
        <ConfirmDialog
          title="Remove offering"
          message={`Remove ${removing.name} from new requests? Existing request history stays unchanged.`}
          confirmLabel="Remove"
          danger
          onConfirm={() => removeOffering(removing)}
          onClose={() => setRemoving(null)}
        />
      )}
      <Toast message={toast} />
    </section>
  )
}

function OfferingForm({ offering, vendorType, onSave, onClose }) {
  const [form, setForm] = useState({
    name: offering?.name ?? '',
    description: offering?.description ?? '',
    price: offering?.price ?? '',
    available: offering?.available ?? true,
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const priceRequired = ['restaurant', 'barber'].includes(vendorType)
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  function submit(e) {
    e.preventDefault()
    const found = validateOffering(form, vendorType)
    setErrors(found)
    if (Object.keys(found).length) return
    setSaving(true)
    onSave(form)
  }

  return (
    <Modal title={offering ? 'Edit offering' : 'Add offering'} onClose={onClose} busy={saving}>
      <form onSubmit={submit} noValidate>
        <ErrorSummary errors={errors} />
        <FormField label="Offering name" value={form.name} onChange={set('name')} error={errors.name} />
        <FormField as="textarea" label="Description" value={form.description} onChange={set('description')} error={errors.description} />
        <FormField
          label="Listed price in SAR"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={form.price}
          onChange={set('price')}
          error={errors.price}
          help={priceRequired ? 'Required for this business type.' : 'Leave blank when the price is quoted offline.'}
        />
        <FormField
          as="select"
          label="Availability"
          value={form.available ? 'yes' : 'no'}
          onChange={(e) => setForm((f) => ({ ...f, available: e.target.value === 'yes' }))}
        >
          <option value="yes">Available</option>
          <option value="no">Unavailable</option>
        </FormField>
        <div className="actions">
          <button type="button" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save offering'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
