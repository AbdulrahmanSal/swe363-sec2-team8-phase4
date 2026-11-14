/** Small validation helpers used by forms and by the data layer. */

export const isBlank = (value) => !String(value ?? '').trim()

export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '').trim())

/** Saudi-style phone: 05 followed by 8 digits. Empty is allowed (phone is optional). */
export const isValidPhone = (value) => isBlank(value) || /^05\d{8}$/.test(String(value).replace(/\s/g, ''))

/**
 * Password rule (AUTH01, NFR04): at least 8 characters with at least one letter and one number.
 * Returns an error message, or '' when the password is fine.
 */
export function passwordProblem(password) {
  const p = String(password ?? '')
  if (p.length < 8) return 'Use at least 8 characters.'
  if (!/[A-Za-z]/.test(p) || !/\d/.test(p)) return 'Include at least one letter and one number.'
  return ''
}
