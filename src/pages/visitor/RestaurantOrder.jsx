import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { PageHeader, StatusBadge, EmptyState, Modal, SuccessModal, ErrorSummary } from '../../components/common/index.js'
import { money } from '../../utils/format.js'
import { serviceVendor } from './requestHelpers.js'

const MAX_QTY = 20

/**
 * S06 · Restaurant pickup order (VIS04)
 * Pick available items with + / −, review the order, submit. Payment happens at the restaurant.
 * Submitting re-checks availability and opening status in placeOrder() before anything is saved.
 */
export default function RestaurantOrder() {
  const { vendorId } = useParams()
  const { user } = useAuth()
  const { data, placeOrder } = useData()
  const [cart, setCart] = useState({}) // { offeringId: quantity }
  const [step, setStep] = useState(null) // null | 'empty' | 'review'
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(null)

  const { vendor, problem } = serviceVendor(data, vendorId, 'restaurant')
  if (!vendor || problem) {
    return (
      <>
        <PageHeader id="S06" screenName="Restaurant order" title="Pickup order" />
        <EmptyState
          title="Ordering unavailable"
          message={problem}
          action={
            <Link to={vendor ? `/vendors/${vendor.id}` : '/directory'} className="button primary">
              {vendor ? 'Back to business' : 'Back to directory'}
            </Link>
          }
        />
      </>
    )
  }

  const menu = data.offerings.filter((o) => o.vendorId === vendor.id && !o.removed)
  const lines = menu.filter((o) => cart[o.id] > 0).map((o) => ({ ...o, qty: cart[o.id] }))
  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0)

  const change = (id, delta) =>
    setCart((c) => ({ ...c, [id]: Math.min(MAX_QTY, Math.max(0, (c[id] ?? 0) + delta)) }))

  const review = () => {
    setErrors({})
    setStep(lines.length ? 'review' : 'empty')
  }

  const submit = () => {
    const result = placeOrder({ user, vendorId: vendor.id, cart })
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    setStep(null)
    setCart({})
    setSubmitted(result.request)
  }

  return (
    <>
      <PageHeader
        id="S06"
        screenName="Restaurant order"
        title="Pickup order"
        subtitle={`${vendor.name} · Select items, review your total, and pay at the restaurant.`}
        actions={
          <Link to={`/vendors/${vendor.id}`} className="button small">
            ← Business
          </Link>
        }
      />

      <div className="split">
        <section className="panel">
          <h2>Menu</h2>
          {menu.length === 0 && <p className="muted">This restaurant has not listed any items yet.</p>}
          {menu.map((item) => (
            <div className="listitem" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <div className="tiny muted">{item.description}</div>
              </div>
              <div className="row">
                <span>{money(item.price)}</span>
                {item.available ? (
                  <div className="quantity" role="group" aria-label={`Quantity of ${item.name}`}>
                    <button type="button" onClick={() => change(item.id, -1)} disabled={!cart[item.id]} aria-label={`Remove one ${item.name}`}>
                      −
                    </button>
                    <strong aria-live="polite">{cart[item.id] ?? 0}</strong>
                    <button type="button" onClick={() => change(item.id, 1)} disabled={cart[item.id] >= MAX_QTY} aria-label={`Add one ${item.name}`}>
                      +
                    </button>
                  </div>
                ) : (
                  <StatusBadge status="Unavailable" />
                )}
              </div>
            </div>
          ))}
        </section>

        <section className="panel" aria-labelledby="cart-title">
          <h2 id="cart-title">Your order</h2>
          {lines.length === 0 ? (
            <p className="muted">No items yet. Use + to add items from the menu.</p>
          ) : (
            lines.map((l) => (
              <div className="summaryline" key={l.id}>
                <span>
                  {l.qty} × {l.name}
                </span>
                <span>{money(l.price * l.qty)}</span>
              </div>
            ))
          )}
          <div className="summaryline total">
            <span>Total</span>
            <span>{money(total)}</span>
          </div>
          <p className="tiny muted">Pickup only · No online payment</p>
          <button type="button" className="primary" onClick={review} style={{ width: '100%' }}>
            Review order
          </button>
        </section>
      </div>

      <Modal
        open={step === 'empty'}
        title="Empty order"
        onClose={() => setStep(null)}
        actions={
          <button type="button" className="primary" onClick={() => setStep(null)}>
            Back to menu
          </button>
        }
      >
        <div className="errorbox" role="alert">
          Add at least one available menu item before reviewing your order.
        </div>
      </Modal>

      <Modal
        open={step === 'review'}
        title="Review pickup order"
        onClose={() => setStep(null)}
        actions={
          <>
            <button type="button" onClick={() => setStep(null)}>
              Cancel
            </button>
            <button type="button" className="primary" onClick={submit}>
              Submit order
            </button>
          </>
        }
      >
        <ErrorSummary errors={errors} title="The order was not submitted:" />
        {lines.map((l) => (
          <div className="summaryline" key={l.id}>
            <span>
              {l.qty} × {l.name}
            </span>
            <span>{money(l.price * l.qty)}</span>
          </div>
        ))}
        <div className="summaryline total">
          <span>Total</span>
          <span>{money(total)}</span>
        </div>
        <div className="notice">
          Pickup from {vendor.location}. Pay at the restaurant. You can cancel only while the order is Pending.
        </div>
      </Modal>

      <SuccessModal
        open={Boolean(submitted)}
        title="Order submitted"
        message={submitted && `Order ${submitted.id} is Pending. ${vendor.name} will confirm it shortly.`}
        detailsTo={submitted && `/requests/${submitted.id}`}
        onClose={() => setSubmitted(null)}
      />
    </>
  )
}
