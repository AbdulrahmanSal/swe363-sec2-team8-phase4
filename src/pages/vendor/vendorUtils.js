/**
 * Helpers shared by the vendor screens (S12–S16) and directory settings (S19).
 * Pure functions only, so they are easy to test and reuse.
 */
import { DAYS, ms } from '../../utils/format.js'
import { isBlank, isValidEmail, isValidPhone } from '../../utils/validation.js'
import { statusGroup } from '../../utils/requestStatus.js'

/** Short request type shown under the request number (matches the S12 and S15 SVGs). */
export const REQUEST_TYPE_SHORT = {
  restaurant: 'Pickup order',
  barber: 'Barber appointment',
  laundry: 'Laundry pickup',
}

/** Statuses offered in the S15 Status filter, in the order a request moves through them. */
export const REQUEST_STATUSES = [
  'Pending',
  'Preparing',
  'Accepted',
  'Scheduled',
  'Collected',
  'Cleaning',
  'Ready',
  'Ready for pickup',
  'Completed',
  'Rejected',
  'Cancelled',
]

/** Badge colour class for any status word. The status text is always shown too (NFR07). */
export function statusTone(status) {
  if (['Pending', 'Scheduled'].includes(status)) return 'warn'
  if (['Completed', 'Active', 'Open', 'Available', 'Approved'].includes(status)) return 'good'
  if (['Rejected', 'Cancelled', 'Removed', 'Unavailable', 'Closed', 'Suspended'].includes(status)) return 'bad'
  // In-progress statuses use the plain grey badge. (The shared `.info` class is the definition-list
  // grid from S05, so it is not used here as a badge colour.)
  return ''
}

/** The date a request is about: the barber slot, the laundry pickup time, or when it was placed. */
export const requestDate = (r) => r.slot || r.confirmedAt || r.preferredAt || r.createdAt

/** Pending / active / completed counts for a list of requests (S12 and S15 metrics). */
export function countRequests(list) {
  const counts = { pending: 0, active: 0, completed: 0 }
  for (const r of list) {
    const group = statusGroup(r.status)
    if (group in counts) counts[group] += 1
  }
  return counts
}

/** Does a request belong to a status filter value? Accepts a status or one of the groups. */
export function matchesStatus(request, filter) {
  if (!filter || filter === 'all') return true
  if (['pending', 'active', 'completed'].includes(filter)) return statusGroup(request.status) === filter
  return request.status === filter
}

/** Offer state worked out from its dates (S16): Scheduled, Active, Expired or Removed. */
export function offerState(offer, now = Date.now()) {
  if (offer.removed) return 'Removed'
  if (ms(offer.startAt) > now) return 'Scheduled'
  return ms(offer.endAt) > now ? 'Active' : 'Expired'
}

/** Newest first by a date field. */
export const newestFirst = (field) => (a, b) => (ms(b[field]) || 0) - (ms(a[field]) || 0)

/**
 * S13 validation (VEN02, VEN03). Returns { field: message }; empty object when valid.
 * Hours errors use the key `hours-<index>` so the message shows beside that day's row.
 */
export function validateBusinessProfile(form) {
  const errors = {}
  if (isBlank(form.name)) errors.name = 'Business name is required.'
  if (isBlank(form.description)) errors.description = 'Description is required.'
  if (isBlank(form.location)) errors.location = 'Written location is required.'
  if (isBlank(form.email)) errors.email = 'Contact email is required.'
  else if (!isValidEmail(form.email)) errors.email = 'Enter a valid contact email.'
  if (!isValidPhone(form.phone)) errors.phone = 'Enter a valid phone number, for example 0500000012.'
  form.weeklyHours.forEach((h, i) => {
    if (h.closed) return
    if (!h.open || !h.close) errors[`hours-${i}`] = `${DAYS[i]}: enter opening and closing times.`
    else if (h.close <= h.open) errors[`hours-${i}`] = `${DAYS[i]}: closing time must be after opening time.`
  })
  return errors
}

/**
 * S14 validation (VEN04). Price is required for restaurants and barbers; stores and laundry may
 * leave it blank (quote offline). A price can never be negative.
 */
export function validateOffering(form, vendorType) {
  const errors = {}
  if (isBlank(form.name)) errors.name = 'Offering name is required.'
  if (isBlank(form.description)) errors.description = 'Description is required.'
  const priceRequired = ['restaurant', 'barber'].includes(vendorType)
  const raw = String(form.price ?? '').trim()
  if (raw === '') {
    if (priceRequired) errors.price = 'Price is required for this business type.'
  } else if (!Number.isFinite(Number(raw)) || Number(raw) < 0) {
    errors.price = 'Enter a price of 0 or more.'
  }
  return errors
}

/** S16 validation (VEN06): title, description, valid start, end after start. */
export function validateOffer(form) {
  const errors = {}
  if (isBlank(form.title)) errors.title = 'Offer title is required.'
  if (isBlank(form.description)) errors.description = 'Description is required.'
  if (!form.startAt) errors.startAt = 'Choose a start date and time.'
  if (!form.endAt) errors.endAt = 'Choose an end date and time.'
  else if (form.startAt && ms(form.endAt) <= ms(form.startAt)) errors.endAt = 'End time must be after the start time.'
  return errors
}

/** S19 validation (ADM03): name required and unique, ignoring case. */
export function validateCategory(name, categories, editingId = null) {
  const clean = String(name ?? '').trim()
  if (!clean) return { name: 'Category name is required.' }
  const taken = categories.some((c) => c.id !== editingId && c.name.trim().toLowerCase() === clean.toLowerCase())
  return taken ? { name: 'A category with this name already exists.' } : {}
}
