/**
 * Creating and changing service requests (VIS04–VIS06, VEN05).
 * Plain functions with no React, so they are easy to read and test:
 * each takes the current data and returns { ok, data, request } or { ok: false, errors }.
 * DataContext wraps them; pages call them through useData().
 *
 * errors = { fieldName: 'message' }; problems that belong to no field use the key `form`.
 */
import { stamp, ms, riyadhDate, fmt } from '../utils/format.js'
import { applyAction, canReschedule, REQUEST_TYPE_LABELS } from '../utils/requestStatus.js'
import { slotsFor, isSlotTaken } from '../utils/booking.js'
import { isBlank } from '../utils/validation.js'

const PREFIX = { restaurant: 'ORD', barber: 'APT', laundry: 'LAU' }

/** Next request number, shared across types like the prototype: ORD-1008, APT-1009, ... */
export function nextRequestId(requests, type) {
  const highest = requests.reduce((max, r) => Math.max(max, Number(r.id.split('-').at(1)) || 0), 1000)
  return `${PREFIX[type]}-${highest + 1}`
}

/** Why a vendor cannot take new requests right now, or '' if it can (VIS03, VEN03). */
export function vendorUnavailableReason(vendor) {
  if (!vendor) return 'This business could not be found.'
  if (vendor.accountStatus !== 'active') return `${vendor.name} is not accepting requests at the moment.`
  if (!vendor.isOpen) return `${vendor.name} is closed right now, so new requests are paused.`
  return ''
}

const fail = (errors) => ({ ok: false, errors })

function checkVisitor(user) {
  if (!user) return 'Log in to submit a request.'
  if (user.role !== 'visitor') return 'Only visitor accounts can submit requests.'
  return ''
}

function withActivity(data, text, now, actor = 'System') {
  const entry = { id: `act-${now.toString(36)}-${data.activity.length}`, at: stamp(now), actor, text }
  return { ...data, activity: [entry, ...data.activity].slice(0, 100) }
}

function addRequest(data, request, now) {
  const vendor = data.vendors.find((v) => v.id === request.vendorId)
  const next = { ...data, requests: [request, ...data.requests] }
  return withActivity(next, `${REQUEST_TYPE_LABELS[request.type]} ${request.id} submitted to ${vendor.name}`, now, request.history.at(0).by)
}

/**
 * VIS04 — place a restaurant pickup order.
 * @param cart { [offeringId]: quantity }
 */
export function placeOrder(data, { user, vendorId, cart }, now = Date.now()) {
  const who = checkVisitor(user)
  if (who) return fail({ form: who })
  const vendor = data.vendors.find((v) => v.id === vendorId)
  const unavailable = vendorUnavailableReason(vendor)
  if (unavailable) return fail({ form: unavailable })
  if (vendor.type !== 'restaurant') return fail({ form: 'This business does not take pickup orders.' })

  const lines = Object.entries(cart ?? {}).filter(([, qty]) => qty > 0)
  if (lines.length === 0) return fail({ form: 'Your cart is empty. Add at least one item.' })

  const items = []
  for (const [offeringId, qty] of lines) {
    const o = data.offerings.find((x) => x.id === offeringId && x.vendorId === vendorId)
    if (!o || o.removed) return fail({ form: 'An item in your cart is no longer on the menu. Review your cart.' })
    if (!o.available) return fail({ form: `${o.name} is no longer available. Remove it to continue.` })
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) return fail({ form: `Choose a quantity from 1 to 20 for ${o.name}.` })
    items.push({ id: o.id, name: o.name, price: o.price, qty })
  }

  const request = {
    id: nextRequestId(data.requests, 'restaurant'),
    type: 'restaurant',
    vendorId,
    visitorId: user.id,
    status: 'Pending',
    createdAt: stamp(now),
    items,
    total: items.reduce((sum, i) => sum + i.price * i.qty, 0),
    history: [{ status: 'Pending', at: stamp(now), by: user.name, reason: '' }],
  }
  return { ok: true, data: addRequest(data, request, now), request }
}

/** Shared slot check for booking and rescheduling. */
function slotProblem(data, vendor, slot, now, ignoreId = null) {
  if (!slot) return 'Choose an available time slot.'
  if (!slotsFor(vendor, riyadhDate(0, ms(slot))).includes(slot)) return 'Choose a time within the barbershop opening hours.'
  if (!(ms(slot) > now)) return 'Choose a time in the future.'
  if (isSlotTaken(data.requests, vendor.id, slot, ignoreId)) return 'That slot was just booked. Choose another time.'
  return ''
}

/** VIS05 — book a barber appointment (Pending; the slot is held right away). */
export function bookAppointment(data, { user, vendorId, serviceId, slot }, now = Date.now()) {
  const who = checkVisitor(user)
  if (who) return fail({ form: who })
  const vendor = data.vendors.find((v) => v.id === vendorId)
  const unavailable = vendorUnavailableReason(vendor)
  if (unavailable) return fail({ form: unavailable })

  const errors = {}
  const service = data.offerings.find((o) => o.id === serviceId && o.vendorId === vendorId)
  if (!service || service.removed || !service.available) errors.service = 'Choose an available service.'
  const problem = slotProblem(data, vendor, slot, now)
  if (problem) errors.slot = problem
  if (Object.keys(errors).length) return fail(errors)

  const request = {
    id: nextRequestId(data.requests, 'barber'),
    type: 'barber',
    vendorId,
    visitorId: user.id,
    status: 'Pending',
    createdAt: stamp(now),
    serviceId: service.id,
    serviceName: service.name,
    price: service.price,
    slot,
    history: [{ status: 'Pending', at: stamp(now), by: user.name, reason: '' }],
  }
  return { ok: true, data: addRequest(data, request, now), request }
}

/**
 * VIS05 alternate flow — move an appointment to a new slot.
 * The old slot is released and the new one reserved in the same update; on any error nothing changes.
 * The appointment goes back to Pending for the barber to confirm again.
 */
export function rescheduleAppointment(data, { user, requestId, slot }, now = Date.now()) {
  const request = data.requests.find((r) => r.id === requestId)
  if (!request || !user || request.visitorId !== user.id) return fail({ form: 'This appointment could not be found.' })
  if (!canReschedule(request, now)) return fail({ form: 'This appointment can no longer be rescheduled.' })
  const vendor = data.vendors.find((v) => v.id === request.vendorId)
  if (slot === request.slot) return fail({ slot: 'Choose a different time from the current one.' })
  const problem = slotProblem(data, vendor, slot, now, request.id)
  if (problem) return fail({ slot: problem })

  const updated = {
    ...request,
    slot,
    status: 'Pending',
    history: [
      ...request.history,
      { status: 'Pending', at: stamp(now), by: user.name, reason: `Rescheduled from ${fmt(request.slot)} to ${fmt(slot)}` },
    ],
  }
  const next = { ...data, requests: data.requests.map((r) => (r.id === requestId ? updated : r)) }
  return { ok: true, data: withActivity(next, `Appointment ${request.id} rescheduled`, now, user.name), request: updated }
}

/** VIS06 — request a laundry pickup. The preferred time is a wish; the vendor confirms the real time. */
export function requestLaundry(data, { user, vendorId, serviceId, pickupLocation, preferredAt, notes }, now = Date.now()) {
  const who = checkVisitor(user)
  if (who) return fail({ form: who })
  const vendor = data.vendors.find((v) => v.id === vendorId)
  const unavailable = vendorUnavailableReason(vendor)
  if (unavailable) return fail({ form: unavailable })

  const errors = {}
  const service = data.offerings.find((o) => o.id === serviceId && o.vendorId === vendorId)
  if (!service || service.removed || !service.available) errors.service = 'Choose a laundry service.'
  if (isBlank(pickupLocation)) errors.pickupLocation = 'Enter the pickup location, for example a building and entrance.'
  else if (pickupLocation.trim().length > 120) errors.pickupLocation = 'Keep the pickup location under 120 characters.'
  if (!preferredAt) errors.preferredAt = 'Choose a preferred pickup date and time.'
  else if (!(ms(preferredAt) > now)) errors.preferredAt = 'The preferred time must be in the future.'
  if ((notes ?? '').length > 300) errors.notes = 'Keep notes under 300 characters.'
  if (Object.keys(errors).length) return fail(errors)

  const request = {
    id: nextRequestId(data.requests, 'laundry'),
    type: 'laundry',
    vendorId,
    visitorId: user.id,
    status: 'Pending',
    createdAt: stamp(now),
    serviceId: service.id,
    serviceName: service.name,
    pickupLocation: pickupLocation.trim(),
    preferredAt,
    confirmedAt: null,
    notes: (notes ?? '').trim(),
    history: [{ status: 'Pending', at: stamp(now), by: user.name, reason: '' }],
  }
  return { ok: true, data: addRequest(data, request, now), request }
}

/**
 * VIS04–VIS06 cancel, VEN05 accept / reject / advance / cancel.
 * Checks ownership (NFR03), then the status rules in utils/requestStatus.js.
 */
export function changeRequestStatus(data, { user, requestId, action, reason, confirmedAt }, now = Date.now()) {
  const request = data.requests.find((r) => r.id === requestId)
  if (!request || !user) return fail({ form: 'This request could not be found.' })
  const role = user.role
  const owns = (role === 'visitor' && request.visitorId === user.id) || (role === 'vendor' && request.vendorId === user.vendorId)
  if (!owns) return fail({ form: 'You do not have access to this request.' })

  const result = applyAction(request, action, { role, by: user.name, reason, confirmedAt, now })
  if (!result.ok) return fail({ [result.field ?? 'form']: result.error })

  const next = { ...data, requests: data.requests.map((r) => (r.id === requestId ? result.request : r)) }
  return {
    ok: true,
    data: withActivity(next, `${request.id} changed to ${result.request.status}`, now, user.name),
    request: result.request,
  }
}
