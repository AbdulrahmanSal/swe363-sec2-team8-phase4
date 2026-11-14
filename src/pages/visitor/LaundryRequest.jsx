import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { PageHeader, FormField, EmptyState, Modal, SuccessModal, ErrorSummary } from '../../components/common/index.js'
import useNow from '../../hooks/useNow.js'
import { fmt, money, dt, toLocalInput, fromLocalInput } from '../../utils/format.js'
import { requestLaundry as checkLaundry } from '../../data/requestService.js'
import { serviceVendor } from './requestHelpers.js'

const listedPrice = (o) => (o.price == null ? 'Price confirmed by vendor' : `Listed ${money(o.price)}`)

/**
 * S08 · Laundry pickup request (VIS06)
 * The preferred time is a wish, not a booking: the vendor confirms the real pickup time,
 * and the final price is agreed offline. Errors appear in a summary and beside each field.
 */
export default function LaundryRequest() {
  const { vendorId } = useParams()
  const { user } = useAuth()
  const { data, requestLaundry } = useData()
  const now = useNow()

  const { vendor, problem } = serviceVendor(data, vendorId, 'laundry')
  const services = vendor ? data.offerings.filter((o) => o.vendorId === vendor.id && !o.removed && o.available) : []

  const [form, setForm] = useState(() => ({
    serviceId: services.at(0)?.id ?? '',
    preferred: toLocalInput(dt(1, '16:00')),
    pickupLocation: '',
    notes: '',
  }))
  const [errors, setErrors] = useState({})
  const [reviewing, setReviewing] = useState(false)
  const [done, setDone] = useState(null)

  if (!vendor || problem) {
    return (
      <>
        <PageHeader id="S08" screenName="Laundry request" title="Request laundry pickup" />
        <EmptyState
          title="Laundry pickup unavailable"
          message={problem}
          action={
            <Link to={vendor ? `/vendors/${vendor.id}` : '/directory'} className="button primary">
              Back
            </Link>
          }
        />
      </>
    )
  }

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((errs) => ({ ...errs, [field === 'preferred' ? 'preferredAt' : field]: undefined, form: undefined }))
  }
  const input = () => ({
    user,
    vendorId: vendor.id,
    serviceId: form.serviceId,
    pickupLocation: form.pickupLocation,
    preferredAt: fromLocalInput(form.preferred),
    notes: form.notes,
  })
  const service = services.find((s) => s.id === form.serviceId)

  // Same rules as the final submit, run without saving, so the form can show errors first.
  const review = (e) => {
    e.preventDefault()
    const check = checkLaundry(data, input(), now)
    if (!check.ok) {
      setErrors(check.errors)
      return
    }
    setErrors({})
    setReviewing(true)
  }

  const submit = () => {
    const result = requestLaundry(input())
    if (!result.ok) {
      setErrors(result.errors)
      setReviewing(false)
      return
    }
    setReviewing(false)
    setForm((f) => ({ ...f, pickupLocation: '', notes: '' }))
    setDone(result.request)
  }

  return (
    <>
      <PageHeader
        id="S08"
        screenName="Laundry request"
        title="Request laundry pickup"
        subtitle={`${vendor.name} · Submit your preference and wait for the vendor to confirm.`}
        actions={
          <Link to={`/vendors/${vendor.id}`} className="button small">
            ← Business
          </Link>
        }
      />

      <section className="panel" style={{ maxWidth: 760 }}>
        <div className="notice">
          Preferred pickup time is not guaranteed. Final pricing is confirmed by the vendor offline; payment happens offline.
        </div>
        <form onSubmit={review} noValidate>
          <ErrorSummary errors={errors} />
          <div className="formgrid">
            <FormField
              label="Laundry service"
              as="select"
              value={form.serviceId}
              onChange={set('serviceId')}
              error={errors.service}
              options={services.map((s) => ({ value: s.id, label: `${s.name} · ${listedPrice(s)}` }))}
            />
            <FormField
              label="Preferred pickup date and time"
              type="datetime-local"
              value={form.preferred}
              min={toLocalInput(new Date(now).toISOString())}
              onChange={set('preferred')}
              error={errors.preferredAt}
              help="Asia/Riyadh time."
              required
            />
            <FormField
              className="full"
              label="Pickup location"
              value={form.pickupLocation}
              onChange={set('pickupLocation')}
              error={errors.pickupLocation}
              placeholder="Building and reception / room"
              maxLength={120}
              required
            />
            <FormField
              className="full"
              label="Optional notes"
              as="textarea"
              value={form.notes}
              onChange={set('notes')}
              error={errors.notes}
              help="For example how many bags, or where to call you."
              maxLength={300}
            />
          </div>
          <button type="submit" className="primary">
            Review request
          </button>
        </form>
      </section>

      <Modal
        open={reviewing}
        title="Review laundry pickup"
        onClose={() => setReviewing(false)}
        actions={
          <>
            <button type="button" onClick={() => setReviewing(false)}>
              Cancel
            </button>
            <button type="button" className="primary" onClick={submit}>
              Submit request
            </button>
          </>
        }
      >
        <dl className="info">
          <dt>Business</dt>
          <dd>{vendor.name}</dd>
          <dt>Service</dt>
          <dd>{service && `${service.name} · ${listedPrice(service)}`}</dd>
          <dt>Preferred time</dt>
          <dd>{fmt(fromLocalInput(form.preferred))}</dd>
          <dt>Pickup location</dt>
          <dd>{form.pickupLocation}</dd>
          <dt>Notes</dt>
          <dd className="preserve-lines">{form.notes || 'None'}</dd>
        </dl>
        <div className="notice">The vendor confirms the actual pickup time. You can cancel until the laundry is collected.</div>
      </Modal>

      <SuccessModal
        open={Boolean(done)}
        title="Pickup requested"
        message={done && `${done.id} is Pending. ${vendor.name} will confirm a pickup time.`}
        detailsTo={done && `/requests/${done.id}`}
        onClose={() => setDone(null)}
      />
    </>
  )
}
