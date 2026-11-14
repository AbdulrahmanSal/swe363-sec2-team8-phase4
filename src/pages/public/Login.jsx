import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { PageHeader, FormField, ErrorSummary } from '../../components/common/index.js'

/** S01/S01b · AUTH01–AUTH02. Authentication is simulated in this browser. */
export default function Login() {
  const { user, login, register } = useAuth()
  const { data } = useData()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const change = field => event => setValues(previous => ({ ...previous, [field]: event.target.value }))
  function switchTab(next) { setTab(next); setErrors({}); setSuccess(false); setValues(previous => ({ ...previous, password: '', confirm: '' })) }
  async function submit(event) {
    event.preventDefault()
    if (saving) return
    setSaving(true); setErrors({}); setSuccess(false)
    try {
      const result = await Promise.resolve(tab === 'login' ? login(values) : register(values))
      setValues(previous => ({ ...previous, password: '', confirm: '' }))
      if (!result.ok) { setErrors(result.errors); return }
      if (tab === 'signup') setSuccess(true)
      else navigate(result.user.role === 'vendor' ? '/vendor' : result.user.role === 'admin' ? '/admin' : '/')
    } finally { setSaving(false) }
  }
  const demoEmails = data.users.filter(account => ['visitor@demo.test', 'club@demo.test', 'v1@demo.test', 'v3@demo.test', 'v4@demo.test', 'v5@demo.test', 'admin@demo.test'].includes(account.email)).map(account => account.email)
  return <><PageHeader id="S01" screenName="Login and sign up" title="Your mall, in one place" subtitle="Sign in to request services or manage your workspace." />
    <div className="auth"><section className="panel">
      <div className="tabs" role="group" aria-label="Account access"><button type="button" className={tab === 'login' ? 'selected' : ''} aria-pressed={tab === 'login'} onClick={() => switchTab('login')}>Login</button><button type="button" className={tab === 'signup' ? 'selected' : ''} aria-pressed={tab === 'signup'} onClick={() => switchTab('signup')}>Sign up</button></div>
      {user && <p className="notice">Signed in as {user.name}. <Link to="/profile">Open account profile</Link>.</p>}
      {success ? <div role="status" className="notice"><h2>Account created</h2><p>Your visitor account is ready.</p><button type="button" className="primary" onClick={() => switchTab('login')}>Back to Login</button></div> : <form onSubmit={submit} noValidate aria-busy={saving}>
        <ErrorSummary errors={errors} />
        {tab === 'signup' && <FormField label="Full name" name="name" autoComplete="name" value={values.name} onChange={change('name')} error={errors.name} required />}
        <FormField label="Email address" name="email" type="email" autoComplete="email" value={values.email} onChange={change('email')} error={errors.email} required />
        <FormField label="Password" name="password" type="password" autoComplete={tab === 'login' ? 'current-password' : 'new-password'} value={values.password} onChange={change('password')} error={errors.password} help={tab === 'signup' ? 'At least 8 characters, including a letter and a number.' : undefined} required />
        {tab === 'signup' && <FormField label="Confirm password" name="confirm" type="password" autoComplete="new-password" value={values.confirm} onChange={change('confirm')} error={errors.confirm} required />}
        <button type="submit" className="primary" style={{ width: '100%' }} disabled={saving}>{saving ? 'Saving…' : tab === 'signup' ? 'Create visitor account' : 'Sign in'}</button>
      </form>}
      <p className="accountnote">Vendor accounts are created by administrators. Club submission permission is granted separately.</p>
    </section><div className="notice"><strong>Demonstration only.</strong> Use the demo account selector above or sign in with a demo account. Password: <strong>Demo1234</strong>. No real credentials.<ul className="demo-emails">{demoEmails.map(email => <li key={email}>{email}</li>)}</ul></div></div>
  </>
}
