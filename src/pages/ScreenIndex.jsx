import { Link } from 'react-router-dom'
import { screens } from '../routes.jsx'

const groups = [
  { role: 'public', title: 'Public & account' },
  { role: 'visitor', title: 'Mall visitor' },
  { role: 'vendor', title: 'Vendor representative' },
  { role: 'admin', title: 'Mall administrator' },
]

// Example IDs so routes with parameters open something during development.
// Replace with real IDs from the mock data once T05 is merged.
const toLink = (path) => path.replace(':vendorId', 'campus-bites').replace(':requestId', 'R-1001')

/** Demo page listing every screen with a direct link (same idea as the Phase 3 prototype). */
export default function ScreenIndex() {
  return (
    <section>
      <div className="eyebrow">Development</div>
      <h1>Screen index</h1>
      <p className="subtitle">Every screen in the app, grouped by user type. For development and demos.</p>

      {groups.map(({ role, title }) => (
        <div key={role} className="screen-group">
          <h2>{title}</h2>
          <ul>
            {screens
              .filter((s) => s.role === role)
              .map((s) => (
                <li key={s.path}>
                  <span className="screenid">{s.id}</span>
                  <Link to={toLink(s.path)}>{s.name}</Link>
                  <code>{s.path}</code>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
