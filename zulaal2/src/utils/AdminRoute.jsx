import { Navigate } from 'react-router-dom'
import { useStore } from '../store'

const ADMIN_ON = import.meta.env.VITE_ALLOW_ADMIN === 'true'

export function AdminRoute({ children }) {
  const user        = useStore(s => s.user)
  const authLoading = useStore(s => s.authLoading)

  if (!ADMIN_ON) return <Navigate to="/" replace />
  if (authLoading) return <div className="admin-loading"><div className="admin-spin" /></div>
  if (!user)  return <Navigate to="/admin/login" replace />
  return children
}

export function AdminLoginRoute({ children }) {
  const user        = useStore(s => s.user)
  const authLoading = useStore(s => s.authLoading)

  if (!ADMIN_ON) return <Navigate to="/" replace />
  if (authLoading) return <div className="admin-loading"><div className="admin-spin" /></div>
  if (user)  return <Navigate to="/admin" replace />
  return children
}
