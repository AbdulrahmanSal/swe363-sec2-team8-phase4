import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { PageHeader, FormField, StatusBadge, EmptyState, Modal, ErrorSummary, useToast } from '../../components/common/index.js'
import { fmt, ms, dt, toLocalInput, fromLocalInput } from '../../utils/format.js'

const STATUS_LABEL = { pending: 'Pending review', approved: 'Approved', rejected: 'Rejected' }
const VISIBILITY = {
  pending: 'Awaiting review · Not public',
  approved: 'Published in the mall feed',
  rejected: 'Not published',
}

const emptyForm = () => ({
  title: '',
  description: '',
  location: '',
  start: toLocalInput(dt(3, '18:00')),
  end: toLocalInput(dt(3, '20:00')),
})

/**
 * S11 · Club submissions and form (VIS08)
 * A visitor with a club permission submits events for their club and follows the admin's decision.
 * If the permission is revoked, earlier submissions stay visible but new ones are blocked (ADM06).
 */
export default function ClubEvents() {
  const { user } = useAuth()
  const { data, submitClubEvent } = useData()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  const mine = data.events.filter((e) => e.submittedBy === user.id).sort((a, b) => ms(b.createdAt) - ms(a.createdAt))

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    const key = { start: 'startAt', end: 'endAt' }[field] ?? field
    setErrors((errs) => ({ ...errs, [key]: undefined, form: undefined }))
  }

  const openForm = () => {
    setForm(emptyForm())
    setErrors({})
    setOpen(true)
  }

  const submit = (e) => {
    e.preventDefault()
    const result = submitClubEvent({
      user,
      title: form.title,
      description: form.description,
      location: form.location,
      startAt: fromLocalInput(form.start),
      endAt: fromLocalInput(form.end),
    })
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    setOpen(false)
    toast(`"${result.request.title}" was submitted for review.`)
  }

  return (
    <>
      <PageHeader
        id="S11"
        screenName="Club submissions and form"
        title="Club events"
        subtitle={
          user.club
            ? `Submit events for ${user.club} and track administrator review.`
            : 'Your past submissions remain available. New submissions require an assigned club permission.'
        }
        actions={
          user.club && (
            <button type="button" className="primary" onClick={openForm}>
              New submission
            </button>
          )
        }
      />

      {!user.club && (
        <div className="notice">
          You do not currently have club representative permission. An administrator must assign it before you can submit
          events.
        </div>
      )}

      {mine.length === 0 ? (
        <EmptyState title="No event submissions" message="Your submissions and review decisions will appear here." />
      ) : (
        mine.map((ev) => (
          <article className="card" key={ev.id}>
            <div className="row between">
              <h2 style={{ margin: 0 }}>{ev.title}</h2>
              <StatusBadge status={STATUS_LABEL[ev.status] ?? ev.status} />
            </div>
            <p className="tiny muted" style={{ marginTop: 8 }}>
              {ev.club} · {fmt(ev.startAt)} · {ev.location}
            </p>
            <p className="preserve-lines">{ev.description}</p>
            {ev.status === 'rejected' && ev.rejectReason && (
              <div className="notice">
                <strong>Administrator reason:</strong> {ev.rejectReason}
              </div>
            )}
            <span className="tiny muted">{VISIBILITY[ev.status]}</span>
          </article>
        ))
      )}

      <Modal open={open} large title="Submit club event" onClose={() => setOpen(false)}>
        <form onSubmit={submit} noValidate>
          <ErrorSummary errors={errors} />
          <FormField label="Assigned club" value={user.club} readOnly help="Events are always submitted for your assigned club." />
          <FormField label="Event title" value={form.title} onChange={set('title')} error={errors.title} maxLength={100} required />
          <FormField label="Description" as="textarea" value={form.description} onChange={set('description')} error={errors.description} maxLength={1000} required />
          <FormField label="Location" value={form.location} onChange={set('location')} error={errors.location} placeholder="For example: Mall seating area" required />
          <div className="formgrid">
            <FormField label="Start date and time" type="datetime-local" value={form.start} onChange={set('start')} error={errors.startAt} required />
            <FormField label="End date and time" type="datetime-local" value={form.end} onChange={set('end')} error={errors.endAt} required />
          </div>
          <p className="tiny muted">Times are in Asia/Riyadh. The event stays private until an administrator approves it.</p>
          <div className="actions">
            <button type="button" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="primary">
              Submit for review
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
