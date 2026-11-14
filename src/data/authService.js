/**
 * Account rules (AUTH01–AUTH03, NFR04). Plain functions like requestService.js;
 * AuthContext wraps them. Each returns { ok: true, ... } or { ok: false, errors }.
 *
 * Note: this is a front-end demo. Passwords sit in the mock data in plain text;
 * the real backend (Phase 5) must store hashes and check them on the server.
 */
import { isBlank, isValidEmail, passwordProblem } from '../utils/validation.js'
import { stamp } from '../utils/format.js'

const GENERIC_LOGIN_ERROR = 'The email or password is incorrect.'

const findByEmail = (data, email) =>
  data.users.find((u) => u.email.toLowerCase() === String(email ?? '').trim().toLowerCase())

/** AUTH02 — check credentials. Vendors whose business is not Active cannot sign in. */
export function login(data, { email, password }) {
  if (isBlank(email) || isBlank(password)) {
    return { ok: false, errors: { form: 'Enter your email and password.' } }
  }
  const user = findByEmail(data, email)
  // Same message for an unknown email and a wrong password, so we never reveal which accounts exist.
  if (!user || user.password !== password) return { ok: false, errors: { form: GENERIC_LOGIN_ERROR } }

  if (user.role === 'vendor') {
    const vendor = data.vendors.find((v) => v.id === user.vendorId)
    if (!vendor || vendor.accountStatus !== 'active') {
      const why = vendor?.accountStatus === 'pending' ? 'is waiting for administrator approval' : 'is not active'
      return { ok: false, errors: { form: `This business account ${why}. Contact mall management.` } }
    }
  }
  return { ok: true, user }
}

/** AUTH01 — create a visitor account. Registration can never create vendor or admin accounts. */
export function register(data, { name, email, password, confirm }) {
  const errors = {}
  if (isBlank(name)) errors.name = 'Enter your name.'
  if (isBlank(email)) errors.email = 'Enter your email.'
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address, for example name@kfupm.edu.sa.'
  else if (findByEmail(data, email)) errors.email = 'An account with this email already exists. Log in instead.'
  const pw = passwordProblem(password)
  if (pw) errors.password = pw
  if (!confirm) errors.confirm = 'Re-enter your password.'
  else if (password !== confirm) errors.confirm = 'The passwords do not match.'
  if (Object.keys(errors).length) return { ok: false, errors }

  const user = {
    id: `u-${Date.now().toString(36)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    role: 'visitor',
    club: '',
  }
  const next = {
    ...data,
    users: [...data.users, user],
    activity: [{ id: `act-${user.id}`, at: stamp(), actor: user.name, text: `New visitor account: ${user.name}` }, ...data.activity].slice(0, 100),
  }
  return { ok: true, data: next, user }
}

/** AUTH03 — change the display name. Email, role and club cannot be changed here. */
export function updateName(data, { userId, name }) {
  if (isBlank(name)) return { ok: false, errors: { name: 'Name cannot be blank.' } }
  return {
    ok: true,
    data: { ...data, users: data.users.map((u) => (u.id === userId ? { ...u, name: name.trim() } : u)) },
  }
}

/** AUTH03 — change password: needs the current password and a valid, matching new one. */
export function changePassword(data, { userId, current, password, confirm }) {
  const user = data.users.find((u) => u.id === userId)
  const errors = {}
  if (!current) errors.current = 'Enter your current password.'
  else if (!user || user.password !== current) errors.current = 'The current password is incorrect.'
  const pw = passwordProblem(password)
  if (pw) errors.password = pw
  else if (password === current) errors.password = 'Choose a password different from the current one.'
  if (!confirm) errors.confirm = 'Re-enter the new password.'
  else if (password !== confirm) errors.confirm = 'The new passwords do not match.'
  if (Object.keys(errors).length) return { ok: false, errors }

  return {
    ok: true,
    data: { ...data, users: data.users.map((u) => (u.id === userId ? { ...u, password } : u)) },
  }
}
