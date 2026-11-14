import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Topbar from '../components/layout/Topbar.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'

/** Page frame from the Figma reference: top bar, left sidebar, and the current screen. */
export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="app">
      <Topbar menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((o) => !o)} />
      <div className="layout">
        <Sidebar open={menuOpen} onNavigate={closeMenu} />
        {menuOpen && <div className="sidebar-backdrop" onClick={closeMenu} aria-hidden="true" />}
        <main className="workspace">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
