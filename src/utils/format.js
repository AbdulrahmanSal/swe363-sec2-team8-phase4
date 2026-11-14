/**
 * Date, money, and ID helpers shared by every screen.
 *
 * Every stored date-time is a full ISO string in UTC, e.g. '2026-11-16T11:00:00.000Z'.
 * Screens always SHOW times in Asia/Riyadh (CON05) through fmt() / fmtDate(), and
 * <input type="datetime-local"> fields convert with toLocalInput() / fromLocalInput().
 */

const RIYADH_OFFSET_MS = 3 * 60 * 60 * 1000

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** 'SAR 15.00' */
export const money = (n) => `SAR ${Number(n).toFixed(2)}`

/** Riyadh calendar date `days` from today, as 'YYYY-MM-DD'. */
export function riyadhDate(days = 0, now = Date.now()) {
  return new Date(now + days * 86400000 + RIYADH_OFFSET_MS).toISOString().slice(0, 10)
}

/** ISO moment for a Riyadh date ('YYYY-MM-DD') and clock time ('HH:MM'). */
export function riyadhISO(date, time = '00:00') {
  return new Date(`${date}T${time}:00+03:00`).toISOString()
}

/** ISO moment `days` from today at Riyadh clock time `time` (used for demo data). */
export function dt(days = 0, time = '18:00', now = Date.now()) {
  return riyadhISO(riyadhDate(days, now), time)
}

/** Milliseconds for any stored date string (NaN if missing or invalid). */
export function ms(value) {
  if (!value) return NaN
  return Date.parse(value)
}

/** ISO value → 'YYYY-MM-DDTHH:MM' in Riyadh time, for datetime-local inputs. */
export function toLocalInput(value) {
  const t = ms(value)
  return Number.isFinite(t) ? new Date(t + RIYADH_OFFSET_MS).toISOString().slice(0, 16) : ''
}

/** datetime-local input value (Riyadh time) → ISO, or '' if empty or invalid. */
export function fromLocalInput(value) {
  if (!value) return ''
  const t = Date.parse(`${value}:00+03:00`)
  return Number.isFinite(t) ? new Date(t).toISOString() : ''
}

/** Riyadh clock time 'HH:MM' of an ISO value. */
export function riyadhTime(value) {
  return toLocalInput(value).slice(11, 16)
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

/** Current moment as an ISO string (used for "created at" and history stamps). */
export const stamp = (now = Date.now()) => new Date(now).toISOString()

/** Random short ID with a prefix, e.g. 'f-K3X9QZ'. Used for non-request records. */
export const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
