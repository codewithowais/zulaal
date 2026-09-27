import { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useStore } from '../store'

function SbLink({ to, icon, badge, children }) {
  return (
    <NavLink to={to} end={to === '/admin'} className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}>
      <svg viewBox="0 0 24 24">{icon}</svg>
      {children}
      {badge > 0 && <span className="sb-cnt">{badge}</span>}
    </NavLink>
  )
}

export default function AdminLayout() {
  const logout         = useStore(s => s.logout)
  const subscribeData  = useStore(s => s.subscribeData)
  const unsubscribeData= useStore(s => s.unsubscribeData)
  const quotes         = useStore(s => s.quotes)
  const messages       = useStore(s => s.messages)
  const toast          = useStore(s => s.toast)
  const navigate       = useNavigate()
  const [clock, setClock] = useState('')

  // Live data subscription when admin is open
  useEffect(() => {
    subscribeData()
    return () => unsubscribeData()
  }, [subscribeData, unsubscribeData])

  useEffect(() => {
    const t = setInterval(() => setClock(new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })), 1000)
    setClock(new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }))
    return () => clearInterval(t)
  }, [])

  const newQ = quotes.filter(q => q.status === 'new').length
  const newM = messages.filter(m => m.status === 'new').length

  const handleLogout = async () => { await logout(); navigate('/admin/login') }

  return (
    <div className="admin-wrap">
      {/* SIDEBAR */}
      <aside className="sb">
        <div className="sb-top">
          <span className="sb-logo">Zul<em>aa</em>l</span>
          <span className="sb-badge">Admin</span>
        </div>
        <nav className="sb-nav">
          <div className="sb-section">Overview</div>
          <SbLink to="/admin" icon={<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>}>Dashboard</SbLink>

          <div className="sb-section">Orders</div>
          <SbLink to="/admin/quotes"   badge={newQ} icon={<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>}>Quote Requests</SbLink>
          <SbLink to="/admin/messages" badge={newM} icon={<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>}>Messages</SbLink>

          <div className="sb-section">Content</div>
          <SbLink to="/admin/products" icon={<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>}>Products</SbLink>

          <div className="sb-section">System</div>
          <SbLink to="/admin/settings" icon={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>}>Settings</SbLink>
        </nav>
        <div className="sb-user">
          <div className="sb-av">A</div>
          <div><div className="sb-nm">Admin</div><div className="sb-rl">Super Admin</div></div>
          <button className="sb-out" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="a-main">
        <div className="a-top">
          <div><h1 id="a-title">Dashboard</h1><p id="a-sub">Welcome back</p></div>
          <div className="a-top-right">
            <span className="a-clock">{clock}</span>
            <button className="a-refresh" onClick={() => window.location.reload()}>↺ Refresh</button>
          </div>
        </div>
        <div className="a-content"><Outlet /></div>
      </main>

      {/* TOAST */}
      <div className="toast-wrap">
        {toast && <div className={`toast show ${toast.type}`}>{toast.msg}</div>}
      </div>
    </div>
  )
}
