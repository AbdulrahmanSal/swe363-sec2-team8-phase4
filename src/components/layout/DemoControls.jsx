import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { DEMO_ACCOUNTS } from '../../data/mockData.js'

const HOME = { visitor: '/', vendor: '/vendor', admin: '/admin' }

/**
 * Labelled demonstration controls (CON01): switch between demo accounts and restore the sample data.
 * Not part of the real product — they let graders test every role quickly.
 */
export default function DemoControls() {
  const { user, loginAs, logout } = useAuth()
  const { data, resetDemo } = useData()
  const navigate = useNavigate()

  const switchTo = (email) => {
    if (!email) {
      logout()
      navigate('/')
      return
    }
    loginAs(email)
    const role = data.users.find((u) => u.email === email)?.role
    navigate(HOME[role] ?? '/')
  }

  return (
    <span className="mh-demo-controls">
      <label>
        <span>Demo account</span>
        <select aria-label="Demo account" value={user?.email ?? ''} onChange={(e) => switchTo(e.target.value)}>
          <option value="">Signed out</option>
          {DEMO_ACCOUNTS.map((a) => (
            <option key={a.email} value={a.email}>
              {a.label}
            </option>
          ))}
          {user && !DEMO_ACCOUNTS.some((a) => a.email === user.email) && <option value={user.email}>{user.name}</option>}
        </select>
      </label>
      <button type="button" onClick={resetDemo} title="Restore the original sample records">
        Reset demo
      </button>
    </span>
  )
}
