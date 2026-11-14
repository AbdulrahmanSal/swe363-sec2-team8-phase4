import { NavLink } from 'react-router-dom'
import Icon from '../common/Icon.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { menus } from './navigation.js'

/** Dark green side menu. Items depend on the signed-in role; on phones it slides in as a drawer. */
export default function Sidebar({ open, onNavigate }) {
  const { user, role } = useAuth()
  const { data } = useData()
  const menu = menus[role]
  // Club events: visitors with a club permission, or with earlier submissions to look back at (VIS08).
  const hasClubHistory = Boolean(user) && data.events.some((e) => e.submittedBy === user.id)
  const items = menu.items.filter((item) => !item.clubOnly || user?.club || hasClubHistory)

  return (
    <aside id="sidebar" className={`mh-portalside ${open ? 'is-open' : ''}`}>
      <div className="mh-side-user">
        <span className="mh-side-avatar" aria-hidden="true">
          {user?.name.at(0) ?? 'G'}
        </span>
        <b>{user?.name ?? 'Guest'}</b>
        <small>{menu.roleLine}</small>
      </div>

      <p className="mh-navlabel">{menu.label.toUpperCase()}</p>
      <nav aria-label="Main navigation">
        {items.map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onNavigate}>
            <Icon name={icon} size={18} />
            <span>{label}</span>
            <Icon name="chevron" size={13} />
          </NavLink>
        ))}
      </nav>

      <div className="mh-sidebarfoot">
        <span className="mh-side-gold" aria-hidden="true" />
        <b>A connected campus community.</b>
        <p>Team 8 · SWE 363 · Phase 4</p>
        <small>All names and records are fictional demo data.</small>
      </div>
    </aside>
  )
}
