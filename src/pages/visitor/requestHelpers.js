/**
 * Small helpers shared by the visitor service screens (S06–S10).
 */
import { vendorUnavailableReason } from '../../data/requestService.js'

/** Short label used in request lists (S09, S15). */
export const SHORT_TYPE_LABEL = {
  restaurant: 'Pickup order',
  barber: 'Barber appointment',
  laundry: 'Laundry pickup',
}

/** The time that matters for a request: the appointment slot, the laundry pickup, or when the order was placed. */
export const requestTime = (r) => r.slot || r.confirmedAt || r.preferredAt || r.createdAt

/** Status filter options in the order a request moves through them. */
export const STATUS_OPTIONS = [
  'Pending',
  'Preparing',
  'Ready for pickup',
  'Accepted',
  'Scheduled',
  'Collected',
  'Cleaning',
  'Ready',
  'Completed',
  'Rejected',
  'Cancelled',
]

export const TYPE_OPTIONS = [
  { value: 'All', label: 'All types' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'barber', label: 'Barber' },
  { value: 'laundry', label: 'Laundry' },
]

/**
 * Look up the vendor for a service screen and explain why it cannot be used, if it cannot.
 * @returns {{ vendor: object|undefined, problem: string }}
 */
export function serviceVendor(data, vendorId, type) {
  const vendor = data.vendors.find((v) => v.id === vendorId)
  if (!vendor) return { vendor, problem: 'This business could not be found.' }
  if (vendor.type !== type) return { vendor, problem: `${vendor.name} does not offer this service.` }
  return { vendor, problem: vendorUnavailableReason(vendor) }
}
