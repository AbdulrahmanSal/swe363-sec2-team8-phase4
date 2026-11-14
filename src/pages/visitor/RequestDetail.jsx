import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { PageHeader, StatusBadge, EmptyState, ConfirmDialog, FormField, useToast } from '../../components/common/index.js'
import useNow from '../../hooks/useNow.js'
import { fmt, money, dt, ms, toLocalInput, fromLocalInput } from '../../utils/format.js'
import { getActions, isFinal, nextStatus, REQUEST_TYPE_LABELS } from '../../utils/requestStatus.js'

const NOTES = {
  restaurant: 'Pickup only · Pay at the restaurant.',
  barber: 'Payment at the barbershop. Completion is enabled once the appointment starts.',
  laundry: 'The vendor confirms pickup time and final price offline.',
}

/**
 * S10 · Shared request detail (VIS04–VIS07, VEN05) — design: S10, S10b (barber), S10c (laundry).
 * mode="visitor" from My Requests, mode="vendor" from Customer requests.
 * Which buttons appear is decided only by getActions() in utils/requestStatus.js (NFR11).
 */
export default function RequestDetail({ mode = 'visitor' }) {
  const { requestId } = useParams()
  const { user } = useAuth()
  const { data, changeRequestStatus } = useData()
  const toast = useToast()
  const now = useNow()
  const [dialog, setDialog] = useState(null) // the action being confirmed
  const [confirmedAt, setConfirmedAt] = useState('')

  const listPath = mode === 'vendor' ? '/vendor/requests' : '/requests'
  const request = data.requests.find((r) => r.id === requestId)
  // Ownership (NFR03): a visitor sees only their own requests, a vendor only their business's.
  const allowed =
    request && (mode === 'vendor' ? request.vendorId === user?.vendorId : request.visitorId === user?.id)

  if (!allowed) {
    return (
      <>
        <PageHeader id="S10" screenName="Shared request detail" title="Request unavailable" />
        <EmptyState
          title="Request not found"
          message="This request does not exist or belongs to another account."
          action={
            <Link to={listPath} className="button primary">
              Back to requests
            </Link>
          }
        />
      </>
    )
  }

  const vendor = data.vendors.find((v) => v.id === request.vendorId)
  const customer = data.users.find((u) => u.id === request.visitorId)
  const actions = getActions(request, mode, now)
  const visitorCannotCancel =
    mode === 'visitor' && !isFinal(request.status) && !actions.some((a) => a.action === 'cancel')

  const open = (a) => {
    if (a.action === 'accept' && a.needsTime) {
      // Suggest the visitor's preferred time if it is still ahead, otherwise tomorrow 16:00.
      setConfirmedAt(toLocalInput(ms(request.preferredAt) > now ? request.preferredAt : dt(1, '16:00')))
    }
    setDialog(a)
  }

  const run = (reason) => {
    const result = changeRequestStatus({
      user,
      requestId: request.id,
      action: dialog.action,
      reason: reason || (dialog.action === 'cancel' ? 'Cancelled by visitor.' : ''),
      confirmedAt: dialog.needsTime ? fromLocalInput(confirmedAt) : undefined,
    })
    if (!result.ok) return result // keeps the dialog open with the errors
    toast(`${request.id} is now ${result.request.status}.`)
    return result
  }

  const dialogText = {
    accept: request.type === 'laundry'
      ? 'Choose the pickup time you can confirm. The visitor sees it under My Requests.'
      : `Accept ${request.id} and start its service workflow?`,
    reject: 'The visitor will see your reason. A barber slot is released.',
    advance: `Mark ${request.id} as ${nextStatus(request)}?`,
    cancel: `${request.id} will be cancelled. This cannot be undone.`,
    'vendor-cancel': `${request.id} will be cancelled. The visitor will see your reason.`,
  }

  return (
    <>
      <PageHeader
        id="S10"
        screenName="Shared request detail"
        title={request.id}
        subtitle={`${REQUEST_TYPE_LABELS[request.type]} · ${vendor?.name ?? 'Unknown business'}`}
        actions={
          <Link to={listPath} className="button small">
            ← Requests
          </Link>
        }
      />

      <div className="row" style={{ marginBottom: 18 }}>
        <StatusBadge status={request.status} />
        <span className="tiny muted">Created {fmt(request.createdAt)}</span>
      </div>

      <div className="split">
        <section className="panel">
          <h2>Request details</h2>
          <dl className="info">
            <dt>Business</dt>
            <dd>{vendor?.name}</dd>
            <dt>Customer</dt>
            <dd>{customer?.name ?? 'Unknown visitor'}</dd>
            {request.type === 'barber' && (
              <>
                <dt>Service</dt>
                <dd>{request.serviceName}</dd>
                <dt>Appointment</dt>
                <dd>{fmt(request.slot)}</dd>
                <dt>Listed price</dt>
                <dd>{money(request.price)}</dd>
              </>
            )}
            {request.type === 'laundry' && (
              <>
                <dt>Service</dt>
                <dd>{request.serviceName}</dd>
                <dt>Pickup location</dt>
                <dd>{request.pickupLocation}</dd>
                <dt>Preferred time</dt>
                <dd>{fmt(request.preferredAt)}</dd>
                <dt>Confirmed time</dt>
                <dd>{request.confirmedAt ? fmt(request.confirmedAt) : 'Awaiting vendor confirmation'}</dd>
                <dt>Notes</dt>
                <dd className="preserve-lines">{request.notes || 'None'}</dd>
                <dt>Final price</dt>
                <dd>Confirmed offline by vendor</dd>
              </>
            )}
          </dl>

          {request.type === 'restaurant' && (
            <>
              <div className="tablewrap">
                <table>
                  <caption className="visuallyhidden">Order items</caption>
                  <thead>
                    <tr>
                      <th scope="col">Item</th>
                      <th scope="col">Quantity</th>
                      <th scope="col">Unit price</th>
                      <th scope="col">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {request.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.qty}</td>
                        <td>{money(item.price)}</td>
                        <td>{money(item.price * item.qty)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="summaryline total">
                <span>Order total</span>
                <span>{money(request.total)}</span>
              </div>
            </>
          )}

          <p className="tiny muted sectiongap">{NOTES[request.type]}</p>
          {visitorCannotCancel && <div className="notice">Visitor cancellation is unavailable at this stage.</div>}
          {isFinal(request.status) && <div className="notice">This request is closed and can no longer change.</div>}

          {actions.length > 0 && (
            <div className="row sectiongap">
              {actions.map((a) =>
                a.action === 'reschedule' ? (
                  <Link key={a.action} to={`/vendors/${request.vendorId}/book?reschedule=${request.id}`} className="button primary">
                    {a.label}
                  </Link>
                ) : (
                  <button
                    key={a.action}
                    type="button"
                    className={a.kind}
                    disabled={a.disabled}
                    aria-describedby={a.hint ? `hint-${a.action}` : undefined}
                    onClick={() => open(a)}
                  >
                    {a.label}
                  </button>
                ),
              )}
            </div>
          )}
          {actions
            .filter((a) => a.hint)
            .map((a) => (
              <p key={a.action} id={`hint-${a.action}`} className="tiny muted">
                {a.hint}
              </p>
            ))}
        </section>

        <section className="panel">
          <h2>Status history</h2>
          <ol className="timeline">
            {request.history
              .slice()
              .reverse()
              .map((h, i) => (
                <li key={`${h.at}-${i}`}>
                  <strong>{h.status}</strong>
                  <small>
                    {fmt(h.at)} · {h.by}
                  </small>
                  {h.reason && (
                    <p className="tiny" style={{ margin: '5px 0 0' }}>
                      {h.reason}
                    </p>
                  )}
                </li>
              ))}
          </ol>
        </section>
      </div>

      {dialog && (
        <ConfirmDialog
          open
          title={dialog.action === 'accept' && dialog.needsTime ? 'Confirm laundry pickup time' : dialog.label}
          message={dialogText[dialog.action]}
          requireReason={dialog.needsReason}
          reasonLabel={dialog.action === 'reject' ? 'Reason for rejecting' : 'Reason for cancelling'}
          confirmLabel={dialog.action === 'accept' && dialog.needsTime ? 'Accept and schedule' : dialog.label}
          onConfirm={run}
          onClose={() => setDialog(null)}
        >
          {dialog.needsTime && (
            <FormField
              label="Confirmed pickup date and time"
              type="datetime-local"
              value={confirmedAt}
              onChange={(e) => setConfirmedAt(e.target.value)}
              help="Asia/Riyadh time."
              required
            />
          )}
        </ConfirmDialog>
      )}
    </>
  )
}
