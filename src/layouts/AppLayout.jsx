import { useEffect, useState } from 'react'
import { Outlet, useLocation, matchPath } from 'react-router-dom'
import Topbar from '../components/layout/Topbar.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'
import DemoControls from '../components/layout/DemoControls.jsx'
import Icon from '../components/common/Icon.jsx'
import { screens } from '../routes.jsx'

/** Page frame: top bar, green side menu, breadcrumb bar with demo controls, and the current screen. */
export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const current = screens.find((s) => matchPath(s.path, pathname))

  // Close the drawer and go back to the top whenever the page changes.
  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo(0, 0)
  }, [pathname])

  // Esc closes the drawer on phones.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="mh-app">
      <a className="mh-skip" href="#main-content">
        Skip to content
      </a>
      <Topbar />
      <div className="mh-portalbody">
        {menuOpen && <button type="button" className="mh-menubackdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
        <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
        <div className="mh-mainwrap">
          <div className="mh-breadcrumb">
            <button
              type="button"
              className="mh-mobilemenu"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="sidebar"
            >
              <Icon name="menu" />
            </button>
            <span>KFUPM Mall Hub</span>
            <Icon name="chevron" size={11} />
            <b>{current?.name ?? (pathname === '/screens' ? 'Screen index' : 'Page')}</b>
            <DemoControls />
          </div>
          <main id="main-content" className="mh-portalmains" tabIndex={-1}>
            <Outlet />
            <footer className="mh-pagefooter">
              <span>© {new Date().getFullYear()} KFUPM Mall Hub · Student course project</span>
              <span>Fictional records · No real university services</span>
            </footer>
          </main>
        </div>
      </div>
    </div>
  )
}
