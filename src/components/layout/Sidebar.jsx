import { NavLink, Link } from 'react-router-dom'
import { menus } from './navigation.js'

import { useAuth } from '../../context/AuthContext.jsx'

/** Left-hand menu from the Figma reference. On mobile it slides in as a drawer. */
export default function Sidebar({ open, onNavigate }) {
  const { user, role } = useAuth()
  const menu = menus[role]

  return (
    <nav id="sidebar" className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Main navigation">
      <button className="menu-toggle small sidebar-close" type="button" onClick={onNavigate}>Close menu</button>
      <p className="navlabel">{menu.label}</p>
      {menu.items.filter(item => item.to !== '/club-events' || user?.club).map(({ to, label, end }) => (
        <NavLink key={to} to={to} end={end} className="navbtn" onClick={onNavigate}>
          {label}
        </NavLink>
      ))}
      <hr />
      <div className="foot">
        Team 8 · SWE 363
        <br />
        All names and records are fictional demo data.
        <br />
        <Link to="/screens" onClick={onNavigate}>
          Screen index
        </Link>
      </div>
    </nav>
  )
}
