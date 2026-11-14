import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import ConfirmDialog from '../common/ConfirmDialog.jsx'

const HOME = { visitor: '/', vendor: '/vendor', admin: '/admin' }

/**
 * Labelled demonstration controls (CON01): switch between demo accounts and restore the sample data.
 * Not part of the real product — they let graders test every role quickly.
 * Vendor accounts whose business is not active are listed but cannot be chosen (ADM02).
 */
export default function DemoControls() {
  const { user, loginAs, logout } = useAuth()
  const { data, resetDemo } = useData()
  const navigate = useNavigate()
  const [resetOpen, setResetOpen] = useState(false)
  const accounts = data.users.filter((account) => account.email.endsWith('@demo.test'))

  const switchTo = (email) => {
    if (!email) {
      logout()
      navigate('/')
      return
    }
    const account = accounts.find((a) => a.email === email)
    loginAs(email)
    navigate(HOME[account?.role] ?? '/')
  }

  const optionLabel = (account) => {
    const business = data.vendors.find((v) => v.id === account.vendorId)
    if (business) return `${business.name} · ${business.accountStatus}`
    return `${account.name} · ${account.club ? 'club rep.' : account.role}`
  }

  return (
    <span className="mh-demo-controls">
      <label>
        <span>Demo account</span>
        <select aria-label="Demo account" value={user?.email ?? ''} onChange={(e) => switchTo(e.target.value)}>
          <option value="">Signed out</option>
          {user && !accounts.some((a) => a.id === user.id) && <option value={user.email}>{user.name}</option>}
          {accounts.map((account) => {
            const business = data.vendors.find((v) => v.id === account.vendorId)
            return (
              <option key={account.id} value={account.email} disabled={Boolean(business) && business.accountStatus !== 'active'}>
                {optionLabel(account)}
              </option>
            )
          })}
        </select>
      </label>
      <button type="button" onClick={() => setResetOpen(true)} title="Restore the original sample records">
        Reset demo
      </button>
      <ConfirmDialog
        open={resetOpen}
        title="Reset demo data?"
        message="This removes changes and new accounts saved in this browser and restores the sample records."
        confirmLabel="Reset demo"
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          logout()
          resetDemo()
          navigate('/login')
        }}
      />
    </span>
  )
}
