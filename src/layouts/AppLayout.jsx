import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Topbar from '../components/layout/Topbar.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'

/** Page frame from the Figma reference: top bar, left sidebar, and the current screen. */
export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    if (!menuOpen) return
    const handleKey = event => { if (event.key === 'Escape') { setMenuOpen(false); document.querySelector('.menu-toggle')?.focus() } }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [menuOpen])

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Topbar menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((o) => !o)} />
      <div className="layout">
        <Sidebar open={menuOpen} onNavigate={closeMenu} />
        {menuOpen && <div className="sidebar-backdrop" onClick={closeMenu} aria-hidden="true" />}
        <main id="main-content" className="workspace" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
