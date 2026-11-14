import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import ConfirmDialog from '../common/ConfirmDialog.jsx'

export default function Topbar({ menuOpen, onToggleMenu }) {
  const { user, role, ownVendor, loginAs, logout } = useAuth()
  const { data, resetDemo } = useData()
  const navigate = useNavigate()
  const [resetOpen, setResetOpen] = useState(false)
  const accounts = data.users.filter(account => account.email.endsWith('@demo.test'))
  const roleLine = role === 'vendor' ? ownVendor?.name : role === 'admin' ? 'Mall administrator' : user?.club ? `Visitor · ${user.club} representative` : 'Mall visitor'
  function switchAccount(event) {
    const email = event.target.value
    if (!email) { logout(); navigate('/'); return }
    const account = accounts.find(item => item.email === email)
    loginAs(email)
    navigate(account?.role === 'admin' ? '/admin' : account?.role === 'vendor' ? '/vendor' : '/')
  }
  return <header className="topbar">
    <div className="topbar-left"><button type="button" className="menu-toggle small" aria-expanded={menuOpen} aria-controls="sidebar" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={onToggleMenu}>{menuOpen ? '×' : '☰'}</button>
      <Link to="/" className="brand"><div className="brandmark" aria-hidden="true">M</div><div><strong>KFUPM Mall Hub</strong><small>Discover · Connect · Request</small></div></Link></div>
    <div className="demo-controls"><label htmlFor="demo-account">Demo account<select id="demo-account" value={user?.email || ''} onChange={switchAccount}>
      <option value="">Public visitor · Signed out</option>
      {user && !accounts.some(account => account.id === user.id) && <option value={user.email}>{user.name}</option>}
      {accounts.map(account => {
        const business = data.vendors.find(vendor => vendor.id === account.vendorId)
        return <option key={account.id} value={account.email} disabled={business && business.status !== 'Active'}>{business ? `${business.name} · ${business.status}` : `${account.name} · ${account.club ? 'Club representative' : account.role}`}</option>
      })}</select></label><button type="button" className="small" onClick={() => setResetOpen(true)}>Reset demo</button></div>
    <div className="identity">{user ? <><div className="avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</div><span className="identity-name">{user.name}<small>{roleLine}</small></span><button type="button" className="small" onClick={() => { logout(); navigate('/login') }}>Sign out</button></> : <Link to="/login" className="button small">Login / Sign up</Link>}</div>
    <ConfirmDialog open={resetOpen} title="Reset demo data?" message="This removes changes and new accounts saved in this browser and restores the sample records." confirmLabel="Reset demo" onClose={() => setResetOpen(false)} onConfirm={() => { logout(); resetDemo(); navigate('/login') }} />
  </header>
}
