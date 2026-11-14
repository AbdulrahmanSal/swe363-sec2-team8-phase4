/**
 * Signed-in user (T06). Must sit inside <DataProvider>.
 *
 *   const { user, role, ownVendor, login, logout, loginAs, register, updateName, changePassword } = useAuth()
 *
 *   user       the signed-in account, or null for guests
 *   role       'guest' | 'visitor' | 'vendor' | 'admin'
 *   ownVendor  for vendor accounts, their business record; otherwise null
 *   login({ email, password })  → { ok: true, user } | { ok: false, errors: { form } }
 *   loginAs(email)              demo account switcher only (CON01) — skips the password
 *   register({ name, email, password, confirm }) → { ok } | { ok: false, errors: { field: message } }
 *
 * The session is kept in localStorage so a refresh keeps you signed in.
 * A vendor whose business is suspended or archived is signed out automatically (ADM02).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useData } from './DataContext.jsx'
import * as authService from '../data/authService.js'

const SESSION_KEY = 'mallhub-session'
const AuthContext = createContext(null)

function loadSession() {
  try {
    return localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const { data, setCollection } = useData()
  const [userId, setUserId] = useState(loadSession)

  useEffect(() => {
    try {
      if (userId) localStorage.setItem(SESSION_KEY, userId)
      else localStorage.removeItem(SESSION_KEY)
    } catch {
      // Storage unavailable: the session just won't survive a refresh.
    }
  }, [userId])

  const found = data.users.find((u) => u.id === userId) ?? null
  const ownVendor = found?.role === 'vendor' ? (data.vendors.find((v) => v.id === found.vendorId) ?? null) : null
  // A vendor account loses access as soon as its business stops being Active.
  const user = found?.role === 'vendor' && ownVendor?.accountStatus !== 'active' ? null : found
  const role = user?.role ?? 'guest'

  const login = useCallback(
    (input) => {
      const result = authService.login(data, input)
      if (result.ok) setUserId(result.user.id)
      return result
    },
    [data],
  )

  const loginAs = useCallback(
    (email) => {
      const target = data.users.find((u) => u.email === email)
      if (target) setUserId(target.id)
    },
    [data],
  )

  const logout = useCallback(() => setUserId(null), [])

  /** Run an authService function that returns new data, and save it. */
  const save = useCallback(
    (result) => {
      if (result.ok) setCollection('users', result.data.users)
      if (result.ok && result.data.activity !== data.activity) setCollection('activity', result.data.activity)
      return result.ok ? { ok: true } : result
    },
    [data.activity, setCollection],
  )

  const register = useCallback((input) => save(authService.register(data, input)), [data, save])
  const updateName = useCallback((name) => save(authService.updateName(data, { userId, name })), [data, save, userId])
  const changePassword = useCallback(
    (input) => save(authService.changePassword(data, { userId, ...input })),
    [data, save, userId],
  )

  const value = useMemo(
    () => ({ user, role, ownVendor, login, loginAs, logout, register, updateName, changePassword }),
    [user, role, ownVendor, login, loginAs, logout, register, updateName, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth() must be used inside <AuthProvider>')
  return ctx
}
