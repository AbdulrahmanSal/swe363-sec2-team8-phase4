import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import EmptyState from './EmptyState.jsx'
export default function ProtectedRoute({ role: allowed, clubOnly = false, children }) {
  const { user, role } = useAuth()
  const { data } = useData()
  const hasClubHistory = user && data.events.some(event => event.owner === user.id)
  const permitted = allowed === 'public' || (allowed === 'authenticated' ? Boolean(user) : role === allowed)
  if (!permitted || (clubOnly && !user?.club && !hasClubHistory)) return <EmptyState title="Access restricted" message="Sign in with an account that has permission to view this page." action={<Link className="button primary" to="/login">Go to login</Link>} />
  return children
}
