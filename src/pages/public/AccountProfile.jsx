import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { passwordProblem } from '../../utils/validation.js'
import { PageHeader, FormField, ErrorSummary, StatusBadge, useToast } from '../../components/common/index.js'

function ProfileForm({ user }) {
  const { update } = useData()
  const toast = useToast()
  const [values, setValues] = useState({ name: user.name, current: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const change = key => event => setValues(previous => ({ ...previous, [key]: event.target.value }))
  async function submit(event) {
    event.preventDefault()
    if (saving) return
    const problems = {}
    if (!values.name.trim()) problems.name = 'Name cannot be blank.'
    const changingPassword = Boolean(values.current || values.password || values.confirm)
    if (changingPassword) {
      if (!values.current) problems.current = 'Enter your current password.'
      else if (values.current !== user.password) problems.current = 'The current password is incorrect.'
      const passwordError = passwordProblem(values.password)
      if (passwordError) problems.password = passwordError
      else if (values.password === values.current) problems.password = 'Choose a password different from the current one.'
      if (!values.confirm) problems.confirm = 'Re-enter the new password.'
      else if (values.password !== values.confirm) problems.confirm = 'The new passwords do not match.'
    }
    setErrors(problems)
    if (Object.keys(problems).length) { setValues(previous => ({ ...previous, current: '', password: '', confirm: '' })); return }
    setSaving(true)
    try {
      // One hook update saves name and password together, avoiding one save overwriting the other.
      await Promise.resolve(update('users', user.id, { name: values.name.trim(), ...(changingPassword ? { password: values.password } : {}) }))
      setValues(previous => ({ ...previous, name: previous.name.trim(), current: '', password: '', confirm: '' }))
      toast('Account profile saved.')
    } finally { setSaving(false) }
  }
  return <section className="panel"><form onSubmit={submit} noValidate aria-busy={saving}>
    <ErrorSummary errors={errors} /><div className="formgrid"><FormField label="Full name" name="name" autoComplete="name" value={values.name} onChange={change('name')} error={errors.name} required /><FormField label="Email address" type="email" value={user.email} readOnly /></div>
    <div className="row"><StatusBadge status={user.role === 'admin' ? 'Administrator' : user.role === 'vendor' ? 'Vendor representative' : 'Visitor'} /><span className="tiny muted">Club permission: {user.club || 'None'}</span></div>
    <h3 className="sectiongap">Change password</h3><p className="muted tiny">Leave password fields blank to update only your name.</p>
    <div className="formgrid"><FormField label="Current password" type="password" name="current" autoComplete="current-password" value={values.current} onChange={change('current')} error={errors.current} /><FormField label="New password" type="password" name="password" autoComplete="new-password" help="At least 8 characters, including a letter and a number." value={values.password} onChange={change('password')} error={errors.password} /><FormField label="Confirm new password" type="password" name="confirm" autoComplete="new-password" value={values.confirm} onChange={change('confirm')} error={errors.confirm} /></div>
    <button className="primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
  </form></section>
}
/** S02 · AUTH03, for every signed-in role. Email and permissions remain read-only. */
export default function AccountProfile() {
  const { user } = useAuth()
  return <><PageHeader id="S02" title="Account profile" subtitle="Update your name or password. Your account email and permissions remain fixed." />{user && <ProfileForm key={user.id} user={user} />}</>
}
