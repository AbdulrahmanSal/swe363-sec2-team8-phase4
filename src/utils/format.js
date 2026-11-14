/**
 * Date, money, and ID helpers shared by every screen.
 *
 * Times are stored as Riyadh local strings without an offset, e.g. '2026-11-16T14:00'
 * (or a full ISO string for "created at" stamps). Always go through these helpers
 * so every screen shows times the same way (CON05: Asia/Riyadh, SAR).
 */

const RIYADH_OFFSET_MS = 3 * 60 * 60 * 1000

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** 'SAR 15.00' */
export const money = (n) => `SAR ${Number(n).toFixed(2)}`

/** Riyadh calendar date `days` from today, as 'YYYY-MM-DD'. */
export function riyadhDate(days = 0, now = Date.now()) {
  return new Date(now + days * 86400000 + RIYADH_OFFSET_MS).toISOString().slice(0, 10)
}

/** Riyadh date-time `days` from today at `time`, as 'YYYY-MM-DDTHH:MM'. */
export function dt(days = 0, time = '18:00', now = Date.now()) {
  return `${riyadhDate(days, now)}T${time}`
}

/** Parse any stored date or date-time string to milliseconds. */
export function ms(value) {
  if (!value) return NaN
  if (value.length === 10) return Date.parse(`${value}T00:00:00+03:00`)
  if (/Z$|[+-]\d\d:\d\d$/.test(value)) return Date.parse(value)
  return Date.parse(`${value}+03:00`)
}

/** '16 Nov 2026, 14:00' in Riyadh time, or 'Not set'. */
export function fmt(value) {
  if (!value) return 'Not set'
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Riyadh',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ms(value)))
}

/** '16 Nov 2026' in Riyadh time. */
export function fmtDate(value) {
  if (!value) return 'Not set'
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Riyadh',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(ms(value)))
}

/** Current moment as a full ISO string (used for "created at" and history stamps). */
export const stamp = (now = Date.now()) => new Date(now).toISOString()

/** Random short ID with a prefix, e.g. 'f-K3X9QZ'. Used for non-request records. */
export const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
