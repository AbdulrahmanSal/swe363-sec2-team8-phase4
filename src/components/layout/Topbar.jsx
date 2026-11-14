import { Link } from 'react-router-dom'

/**
 * Top bar from the Figma reference: brand on the left, signed-in user (or login link) on the right.
 * The menu button only shows on small screens, where the sidebar becomes a slide-out drawer.
 * T08 replaces the hard-coded login link with the signed-in user from AuthContext.
 */
export default function Topbar({ menuOpen, onToggleMenu }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="menu-toggle small"
          aria-expanded={menuOpen}
          aria-controls="sidebar"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={onToggleMenu}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
        <Link to="/" className="brand">
          <div className="brandmark" aria-hidden="true">M</div>
          <div>
            <strong>KFUPM Mall Hub</strong>
            <small>Discover · Connect · Request</small>
          </div>
        </Link>
      </div>

      <div className="identity">
        <Link to="/login" className="button small">
          Login / Sign up
        </Link>
      </div>
    </header>
  )
}
