import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store'
import PublicSite   from './pages/PublicSite'
import AdminLogin   from './admin/AdminLogin'
import AdminLayout  from './admin/AdminLayout'
import { Dashboard, Quotes, Messages, Products, Settings } from './admin/pages/index'
import { AdminRoute, AdminLoginRoute } from './utils/AdminRoute'

export default function App() {
  const initAuth = useStore(s => s.initAuth)

  // Bootstrap Firebase auth listener once on mount
  useEffect(() => {
    const unsub = initAuth()
    return unsub
  }, [initAuth])

  return (
    <Routes>
      {/* ── PUBLIC ─────────────────────────────────────── */}
      <Route path="/" element={<PublicSite />} />

      {/* ── ADMIN LOGIN (env-gated) ─────────────────────── */}
      <Route path="/admin/login" element={
        <AdminLoginRoute><AdminLogin /></AdminLoginRoute>
      } />

      {/* ── ADMIN PANEL (env-gated + auth-gated) ──────── */}
      <Route path="/admin" element={
        <AdminRoute><AdminLayout /></AdminRoute>
      }>
        <Route index          element={<Dashboard />} />
        <Route path="quotes"  element={<Quotes />}    />
        <Route path="messages"element={<Messages />}  />
        <Route path="products"element={<Products />}  />
        <Route path="settings"element={<Settings />}  />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
