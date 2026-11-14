import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { AdminModuleProvider } from './AdminBridge.jsx'

/**
 * Connects Ibrahim's admin pages (S17, S18, S20–S23) to the team's real hooks.
 * His AdminModuleProvider expects the collections at the top level plus add / update / remove,
 * so the DataContext value is flattened here.
 */
export default function AdminWorkspace({ children }) {
  const auth = useAuth()
  const { data, add, update, remove } = useData()
  const navigate = useNavigate()

  return (
    <AdminModuleProvider auth={auth} data={{ ...data, add, update, remove }} navigate={navigate}>
      {children}
    </AdminModuleProvider>
  )
}
