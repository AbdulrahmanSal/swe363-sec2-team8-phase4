import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { PageHeader, FormField, EmptyState, Modal, SuccessModal, ErrorSummary } from '../../components/common/index.js'
import useNow from '../../hooks/useNow.js'
import { fmt, money, ms, riyadhDate, riyadhTime } from '../../utils/format.js'
import { slotsFor, isSlotTaken, isFutureSlot, hoursFor } from '../../utils/booking.js'
import { canReschedule } from '../../utils/requestStatus.js'
import { serviceVendor } from './requestHelpers.js'

const BOOKING_WINDOW_DAYS = 30

/**
 * S07 · Barber booking (VIS05) — also the reschedule screen (?reschedule=APT-1003).
 * 30-minute slots inside the day's opening hours; slots held by Pending or Accepted bookings
 * and past slots are disabled. The slot is checked again on submit (NFR05).
 */
export default function BarberBooking() {
  const { vendorId } = useParams()
  const [params] = useSearchParams()
  const rescheduleId = params.get('reschedule')
  const { user } = useAuth()
  const { data, bookAppointment, rescheduleAppointment } = useData()
  const now = useNow()

  const original = rescheduleId ? data.requests.find((r) => r.id === rescheduleId) : null
  const { vendor, problem } = serviceVendor(data, vendorId, 'barber')
  const services = vendor ? data.offerings.filter((o) => o.vendorId === vendor.id && !o.removed && o.available) : []

  const [serviceId, setServiceId] = useState(() => original?.serviceId ?? services.at(0)?.id ?? '')
  // Rescheduling opens on the day of the current appointment; a new booking opens on tomorrow.
  const [date, setDate] = useState(() => (original ? riyadhDate(0, ms(original.slot)) : riyadhDate(1)))
  const [slot, setSlot] = useState('')
  const [step, setStep] = useState(null) // null | 'missing' | 'review'
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(null)

  const rescheduleProblem =
    rescheduleId &&
    (!original || original.visitorId !== user?.id || original.vendorId !== vendorId
      ? 'This appointment could not be found.'
      : !canReschedule(original, now)
        ? 'This appointment can no longer be rescheduled.'
        : '')
  const blocking = problem || rescheduleProblem
  if (!vendor || blocking) {
    return (
      <>
        <PageHeader id="S07" screenName="Barber booking" title="Book a barber appointment" />
        <EmptyState
          title={rescheduleId ? 'Rescheduling unavailable' : 'Booking unavailable'}
          message={blocking}
          action={
            <Link to={rescheduleId ? '/requests' : vendor ? `/vendors/${vendor.id}` : '/directory'} className="button primary">
              {rescheduleId ? 'Back to My Requests' : 'Back'}
            </Link>
          }
        />
      </>
    )
  }

  const service = services.find((s) => s.id === serviceId)
  const dayHours = hoursFor(vendor, date)
  const slots = slotsFor(vendor, date).map((s) => ({
    value: s,
    taken: isSlotTaken(data.requests, vendor.id, s, original?.id),
    past: !isFutureSlot(s, now),
    current: s === original?.slot,
  }))

  const pickDate = (value) => {
    setDate(value)
    setSlot('')
  }

  const review = () => {
    setErrors({})
    const chosen = slots.find((s) => s.value === slot)
    setStep(service && chosen && !chosen.taken && !chosen.past && !chosen.current ? 'review' : 'missing')
  }

  const submit = () => {
    const result = original
      ? rescheduleAppointment({ user, requestId: original.id, slot })
      : bookAppointment({ user, vendorId: vendor.id, serviceId, slot })
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    setStep(null)
    setSlot('')
    setDone(result.request)
  }

  return (
    <>
      <PageHeader
        id="S07"
        screenName="Barber booking"
        title={original ? `Reschedule ${original.id}` : 'Book a barber appointment'}
        subtitle={`${vendor.name} · One 30-minute appointment per slot. Payment at the barbershop.`}
        actions={
          <Link to={original ? `/requests/${original.id}` : `/vendors/${vendor.id}`} className="button small">
            {original ? '← Request' : '← Business'}
          </Link>
        }
      />

      {original && (
        <div className="notice">
          Current appointment: {fmt(original.slot)}. Your current slot is released only if the new one is saved, and the
          booking goes back to Pending for the barber to confirm.
        </div>
      )}

      <div className="split">
        <section className="panel">
          <div className="formgrid">
            <FormField
              label="Service"
              as="select"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              disabled={Boolean(original)}
              help={original ? 'The service stays the same when rescheduling.' : undefined}
              options={services.map((s) => ({ value: s.id, label: `${s.name} · ${money(s.price)}` }))}
            />
            <FormField
              label="Date"
              type="date"
              value={date}
              min={riyadhDate(0, now)}
              max={riyadhDate(BOOKING_WINDOW_DAYS, now)}
              onChange={(e) => pickDate(e.target.value)}
            />
          </div>

          <h3>Choose an available slot</h3>
          <p className="tiny muted">Times are in Asia/Riyadh. Crossed-out slots are past or reserved.</p>
          {!dayHours || dayHours.closed || slots.length === 0 ? (
            <EmptyState title="Closed on this day" message="Choose another date to see available slots." />
          ) : (
            <div className="slots" role="radiogroup" aria-label="Available time slots">
              {slots.map((s) => {
                const unavailable = s.taken || s.past || s.current
                return (
                  <button
                    key={s.value}
                    type="button"
                    role="radio"
                    aria-checked={slot === s.value}
                    className={`slot ${slot === s.value ? 'selected' : ''}`}
                    disabled={unavailable}
                    title={s.current ? 'Your current slot' : s.taken ? 'Reserved' : s.past ? 'Already passed' : undefined}
                    aria-label={`${riyadhTime(s.value)}${s.current ? ', your current slot' : s.taken ? ', reserved' : s.past ? ', passed' : ''}`}
                    onClick={() => setSlot(s.value)}
                  >
                    {riyadhTime(s.value)}
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <section className="panel">
          <h2>Your booking</h2>
          <dl className="info">
            <dt>Service</dt>
            <dd>{service ? `${service.name} · ${money(service.price)}` : 'Choose a service'}</dd>
            <dt>Time</dt>
            <dd>{slot ? fmt(slot) : 'Choose a slot'}</dd>
          </dl>
          <div className="notice">
            Your slot is reserved while the vendor reviews your booking. Acceptance is shown under My Requests.
          </div>
          <button type="button" className="primary" onClick={review} style={{ width: '100%' }}>
            {original ? 'Review new time' : 'Review booking'}
          </button>
        </section>
      </div>

      <Modal
        open={step === 'missing'}
        title="Choose an available appointment"
        onClose={() => setStep(null)}
        actions={
          <button type="button" className="primary" onClick={() => setStep(null)}>
            Choose slot
          </button>
        }
      >
        <div className="errorbox" role="alert">
          Select an available service and a future slot. Reserved slots cannot be booked.
        </div>
      </Modal>

      <Modal
        open={step === 'review'}
        title={original ? 'Confirm reschedule' : 'Review appointment'}
        onClose={() => setStep(null)}
        actions={
          <>
            <button type="button" onClick={() => setStep(null)}>
              Cancel
            </button>
            <button type="button" className="primary" onClick={submit}>
              {original ? 'Confirm new time' : 'Submit booking'}
            </button>
          </>
        }
      >
        <ErrorSummary errors={errors} title="The booking was not saved:" />
        <dl className="info">
          <dt>Business</dt>
          <dd>{vendor.name}</dd>
          <dt>Service</dt>
          <dd>{service?.name}</dd>
          <dt>Time</dt>
          <dd>{slot && fmt(slot)}</dd>
          <dt>Price</dt>
          <dd>{service && money(service.price)} · Pay at the barbershop</dd>
        </dl>
        <div className="notice">
          {original
            ? 'Your old slot is released only if this change succeeds. The booking returns to Pending.'
            : 'The slot is reserved immediately and awaits vendor acceptance.'}
        </div>
      </Modal>

      <SuccessModal
        open={Boolean(done)}
        title={original ? 'Appointment rescheduled' : 'Appointment requested'}
        message={done && `${done.id} is Pending for ${fmt(done.slot)}. ${vendor.name} will accept or reject it.`}
        detailsTo={done && `/requests/${done.id}`}
        onClose={() => setDone(null)}
      />
    </>
  )
}
