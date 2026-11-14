import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="empty">
      <h3>Page not found</h3>
      <p className="muted">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="button primary">
        Back to the mall feed
      </Link>
    </div>
  )
}
