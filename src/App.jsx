import { Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout.jsx'
import { screens } from './routes.jsx'
import ScreenIndex from './pages/ScreenIndex.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import ComponentsDemo from './pages/ComponentsDemo.jsx'
import NotFound from './pages/NotFound.jsx'

/**
 * Top-level router. Every screen (S01–S23) is declared once in routes.jsx,
 * so adding or renaming a page only touches that file and the page itself.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {screens.map(({ path, element, role, clubOnly }) => (
          <Route key={path} path={path} element={<ProtectedRoute role={role} clubOnly={clubOnly}>{element}</ProtectedRoute>} />
        ))}
        <Route path="/components" element={<ComponentsDemo />} />
        <Route path="/screens" element={<ScreenIndex />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
