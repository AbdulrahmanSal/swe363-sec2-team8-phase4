import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import useToastMessage from './useToastMessage.js'
import { AccessRestricted, ErrorSummary, FormField, PageHeader, Toast } from './VendorUi.jsx'
import { validateBusinessProfile } from './vendorUtils.js'
import './vendor.css'

const ACCOUNT_STATUS = { pending: 'Pending approval', active: 'Active', suspended: 'Suspended', archived: 'Archived' }

/** S13 · Business profile editor (VEN02, VEN03) */
export default function BusinessProfile() {
  const { role, ownVendor } = useAuth()

  if (role !== 'vendor' || !ownVendor) {
    return <AccessRestricted message="Sign in with a vendor representative account to edit a business profile." />
  }

  // Keyed by vendor, so switching demo accounts loads the other business into the form.
  return <BusinessForm key={ownVendor.id} vendor={ownVendor} />
}

function BusinessForm({ vendor }) {
  const { user } = useAuth()
  const { data, update, logActivity } = useData()
  const [form, setForm] = useState(() => ({
    name: vendor.name,
    description: vendor.description,
    location: vendor.location,
    email: vendor.email,
    phone: vendor.phone,
    isOpen: vendor.isOpen,
    weeklyHours: vendor.weeklyHours.map((h) => ({ ...h })),
  }))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [toast, showToast] = useToastMessage()

  const category = data.categories.find((c) => c.id === vendor.categoryId)?.name ?? 'Uncategorised'

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  const setHours = (index, changes) =>
    setForm((f) => ({ ...f, weeklyHours: f.weeklyHours.map((h, i) => (i === index ? { ...h, ...changes } : h)) }))

  function save(e) {
    e.preventDefault()
    const found = validateBusinessProfile(form)
    setErrors(found)
    if (Object.keys(found).length) return

    setSaving(true)
    update('vendors', vendor.id, {
      name: form.name.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      email: form.email.trim(),
      phone: form.phone.replace(/\s/g, ''),
      isOpen: form.isOpen,
      weeklyHours: form.weeklyHours,
    })
    logActivity(`Business profile updated: ${form.name.trim()}`, user.name)
    setSaving(false)
    showToast('Business profile saved.')
  }

  return (
    <section>
      <PageHeader
        id="S13"
        screenName="Business profile editor"
        eyebrow="Business workspace"
        title="Business profile"
        subtitle="Keep your business details accurate. Account permissions are controlled by administrators."
        actions={
          <Link className="button small" to={`/vendors/${vendor.id}`}>
            Public preview
          </Link>
        }
      />

      <section className="panel">
        <form onSubmit={save} noValidate>
          <ErrorSummary errors={errors} />
          <div className="formgrid">
            <FormField label="Business name" value={form.name} onChange={set('name')} error={errors.name} autoComplete="organization" />
            <FormField label="Category" value={category} readOnly help="Set by the mall administrator." />
            <FormField
              as="textarea"
              className="full"
              label="Description"
              value={form.description}
              onChange={set('description')}
              error={errors.description}
            />
            <FormField label="Written location" value={form.location} onChange={set('location')} error={errors.location} />
            <FormField
              label="Contact email"
              type="email"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
              autoComplete="email"
            />
            <FormField
              label="Phone number (optional)"
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              error={errors.phone}
              autoComplete="tel"
            />
            <FormField
              as="select"
              label="Operating status"
              value={form.isOpen ? 'open' : 'closed'}
              onChange={(e) => setForm((f) => ({ ...f, isOpen: e.target.value === 'open' }))}
              help="Closed blocks new orders and bookings. Existing requests are not changed."
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </FormField>
            <FormField label="Account status" value={ACCOUNT_STATUS[vendor.accountStatus]} readOnly help="Controlled by the mall administrator." />
          </div>

          <fieldset className="vd-hours">
            <legend>
              <h3>Weekly opening hours</h3>
            </legend>
            <p className="tiny muted">
              30-minute barber slots are generated within these hours. Manual operating status is separate.
            </p>
            <div className="hoursrow vd-hourshead" aria-hidden="true">
              <span>Day</span>
              <span>Opens</span>
              <span>Closes</span>
              <span />
            </div>
            {form.weeklyHours.map((h, i) => {
              const error = errors[`hours-${i}`]
              const errorId = `hours-error-${i}`
              return (
                <div className="hoursrow" key={h.day}>
                  <span>{h.day.slice(0, 3)}</span>
                  <input
                    type="time"
                    aria-label={`${h.day} opens`}
                    value={h.open}
                    disabled={h.closed}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    className={error ? 'field-invalid' : undefined}
                    onChange={(e) => setHours(i, { open: e.target.value })}
                  />
                  <input
                    type="time"
                    aria-label={`${h.day} closes`}
                    value={h.close}
                    disabled={h.closed}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    className={error ? 'field-invalid' : undefined}
                    onChange={(e) => setHours(i, { close: e.target.value })}
                  />
                  <label>
                    <input type="checkbox" checked={h.closed} onChange={(e) => setHours(i, { closed: e.target.checked })} />
                    Closed<span className="visuallyhidden"> on {h.day}</span>
                  </label>
                  {error && (
                    <span className="field-error" id={errorId}>
                      {error}
                    </span>
                  )}
                </div>
              )
            })}
          </fieldset>

          <div className="vd-formactions">
            <button type="submit" className="primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save business profile'}
            </button>
          </div>
        </form>
      </section>
      <Toast message={toast} />
    </section>
  )
}
