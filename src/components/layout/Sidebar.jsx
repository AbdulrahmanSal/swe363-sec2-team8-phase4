import { NavLink, Link, useLocation } from 'react-router-dom'
import { menus, roleFromPath } from './navigation.js'

/** Left-hand menu from the Figma reference. On mobile it slides in as a drawer. */
export default function Sidebar({ open, onNavigate }) {
  const { pathname } = useLocation()
  const menu = menus[roleFromPath(pathname)]

  return (
    <nav id="sidebar" className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Main navigation">
      <p className="navlabel">{menu.label}</p>
      {menu.items.map(({ to, label, end }) => (
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
