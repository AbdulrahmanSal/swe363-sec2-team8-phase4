/**
 * Request status rules (T07) — the ONE place that decides how requests move between statuses
 * and which buttons each user sees (NFR11). Used by S10 (both modes), S09, S12 and S15.
 *
 * Restaurant order:   Pending → Preparing → Ready for pickup → Completed
 * Barber appointment: Pending → Accepted → Completed
 * Laundry pickup:     Pending → Scheduled → Collected → Cleaning → Ready → Completed
 * Rejected and Cancelled are the other final states. Final requests cannot change.
 */
import { ms } from './format.js'

export const STATUS_SEQUENCE = {
  restaurant: ['Pending', 'Preparing', 'Ready for pickup', 'Completed'],
  barber: ['Pending', 'Accepted', 'Completed'],
  laundry: ['Pending', 'Scheduled', 'Collected', 'Cleaning', 'Ready', 'Completed'],
}

export const FINAL_STATUSES = ['Completed', 'Rejected', 'Cancelled']

export const REQUEST_TYPE_LABELS = {
  restaurant: 'Restaurant pickup',
  barber: 'Barber appointment',
  laundry: 'Laundry pickup',
}

export const isFinal = (status) => FINAL_STATUSES.includes(status)

/** The status after the current one in the normal path, or undefined. */
export function nextStatus(request) {
  const seq = STATUS_SEQUENCE[request.type]
  const i = seq.indexOf(request.status)
  return i >= 0 ? seq.at(i + 1) : undefined
}

/** Grouping used by the dashboard counters (S09, S12): 'pending' | 'active' | 'completed' | 'closed'. */
export function statusGroup(status) {
  if (status === 'Pending') return 'pending'
  if (status === 'Completed') return 'completed'
  if (isFinal(status)) return 'closed'
  return 'active'
}

/** Visitor may cancel: orders only while Pending; barber before the slot starts; laundry before collection. */
export function canVisitorCancel(request, now = Date.now()) {
  if (request.type === 'restaurant') return request.status === 'Pending'
  if (request.type === 'barber') return ['Pending', 'Accepted'].includes(request.status) && ms(request.slot) > now
  return ['Pending', 'Scheduled'].includes(request.status)
}

/** Visitor may reschedule a barber appointment that is Pending or Accepted and has not started. */
export function canReschedule(request, now = Date.now()) {
  return request.type === 'barber' && ['Pending', 'Accepted'].includes(request.status) && ms(request.slot) > now
}

/**
 * Actions the current user may take on a request right now.
 * Each action: { action, label, kind: 'primary'|'danger', needsReason, needsTime, disabled, hint }
 *   action      'cancel' | 'reschedule' | 'accept' | 'reject' | 'advance' | 'vendor-cancel'
 *   needsReason the confirm dialog must collect a reason
 *   needsTime   the dialog must collect a confirmed pickup time (laundry accept, stored as confirmedAt)
 *   disabled    shown but not clickable; `hint` says why
 *
 * @param {object} request
 * @param {'visitor'|'vendor'} role  who is looking at it (the page checks ownership separately)
 */
export function getActions(request, role, now = Date.now()) {
  if (isFinal(request.status)) return []
  const actions = []

  if (role === 'visitor') {
    if (canReschedule(request, now)) {
      actions.push({ action: 'reschedule', label: 'Reschedule', kind: 'primary', needsReason: false, needsTime: false, disabled: false })
    }
    if (canVisitorCancel(request, now)) {
      actions.push({ action: 'cancel', label: 'Cancel request', kind: 'danger', needsReason: false, needsTime: false, disabled: false })
    }
    return actions
  }

  if (role === 'vendor') {
    if (request.status === 'Pending') {
      actions.push({
        action: 'accept',
        label: 'Accept request',
        kind: 'primary',
        needsReason: false,
        needsTime: request.type === 'laundry',
        disabled: false,
      })
      actions.push({ action: 'reject', label: 'Reject', kind: 'danger', needsReason: true, needsTime: false, disabled: false })
    } else {
      const next = nextStatus(request)
      if (next) {
        const tooEarly = request.type === 'barber' && next === 'Completed' && ms(request.slot) > now
        actions.push({
          action: 'advance',
          label: `Mark ${next}`,
          kind: 'primary',
          needsReason: false,
          needsTime: false,
          disabled: tooEarly,
          hint: tooEarly ? 'An appointment can be completed only after it starts.' : '',
        })
      }
    }
    actions.push({ action: 'vendor-cancel', label: 'Cancel request', kind: 'danger', needsReason: true, needsTime: false, disabled: false })
  }

  return actions
}

/**
 * Apply an action and return the updated request (the original is not changed).
 *
 * @returns {{ ok: true, request: object } | { ok: false, error: string, field?: string }}
 * @param {object} options { role, by, reason, confirmedAt, now }
 *   by          name stored in the history entry
 *   confirmedAt laundry pickup time as an ISO string (required to accept laundry)
 */
export function applyAction(request, action, { role, by, reason = '', confirmedAt = '', now = Date.now() } = {}) {
  const allowed = getActions(request, role, now).find((a) => a.action === action)
  if (!allowed || allowed.disabled) {
    return { ok: false, error: 'This action is not available for the request in its current status.' }
  }
  if (allowed.needsReason && !reason.trim()) {
    return { ok: false, error: 'Enter a reason.', field: 'reason' }
  }
  if (allowed.needsTime) {
    if (!confirmedAt) return { ok: false, error: 'Choose the confirmed pickup time.', field: 'confirmedAt' }
    if (!(ms(confirmedAt) > now)) return { ok: false, error: 'The confirmed pickup time must be in the future.', field: 'confirmedAt' }
  }

  let status
  const changes = {}
  switch (action) {
    case 'cancel':
    case 'vendor-cancel':
      status = 'Cancelled'
      break
    case 'reject':
      status = 'Rejected'
      break
    case 'accept':
      status = STATUS_SEQUENCE[request.type].at(1) // Preparing / Accepted / Scheduled
      if (request.type === 'laundry') changes.confirmedAt = confirmedAt
      break
    case 'advance':
      status = nextStatus(request)
      break
    default:
      return { ok: false, error: `Unknown action: ${action}` }
  }

  const entry = { status, at: new Date(now).toISOString(), by, reason: reason.trim() }
  return {
    ok: true,
    request: { ...request, ...changes, status, history: [...request.history, entry] },
  }
}
