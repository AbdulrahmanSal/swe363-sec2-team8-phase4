/**
 * Barber booking helpers (VIS05, NFR05): 30-minute slots inside opening hours,
 * one appointment per slot. Pending and Accepted appointments both hold their slot.
 */
import { DAYS, ms } from './format.js'

export const SLOT_MINUTES = 30

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}
const toHHMM = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

/** Day name ('Sunday'…) for a 'YYYY-MM-DD' date. */
export function dayName(date) {
  return DAYS.at(new Date(`${date}T12:00:00Z`).getUTCDay())
}

/** The vendor's opening hours entry for a date, or undefined. */
export function hoursFor(vendor, date) {
  const day = dayName(date)
  return vendor.hours.find((h) => h.day === day)
}

/** Every slot start time ('YYYY-MM-DDTHH:MM') on a date, from opening to the last full slot before closing. */
export function slotsFor(vendor, date) {
  const h = hoursFor(vendor, date)
  if (!h || h.closed) return []
  const slots = []
  for (let t = toMinutes(h.open); t + SLOT_MINUTES <= toMinutes(h.close); t += SLOT_MINUTES) {
    slots.push(`${date}T${toHHMM(t)}`)
  }
  return slots
}

/** True when another Pending or Accepted appointment at this barber already holds the slot. */
export function isSlotTaken(requests, vendorId, slot, ignoreRequestId = null) {
  return requests.some(
    (r) =>
      r.type === 'barber' &&
      r.vendorId === vendorId &&
      r.id !== ignoreRequestId &&
      ['Pending', 'Accepted'].includes(r.status) &&
      r.slot === slot,
  )
}

/** True when the slot starts in the future. */
export const isFutureSlot = (slot, now = Date.now()) => ms(slot) > now
