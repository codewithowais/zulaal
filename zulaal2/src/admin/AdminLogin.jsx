import { useState } from 'react'
import { useStore } from '../store'

export default function AdminLogin() {
  const login = useStore(s => s.login)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handle = async () => {
    setError('')
    if (!email || !password) { setError('Please enter email and password.'); return }
    setLoading(true)
    try { await login(email, password) }
    catch (e) { setError(e.message.includes('not configured') ? e.message : 'Invalid email or password.') }
    finally { setLoading(false) }
  }

  return (
    <div className="admin-login">
      <div className="al-logo">Zul<em>aa</em>l</div>
      <div className="al-card">
        <h2>Admin Panel</h2>
        <p>Sign in to manage orders, messages, and content.</p>
        <input type="email"    className="al-inp" placeholder="admin@zulaal.pk" value={email}    onChange={e => setEmail(e.target.value)}    onKeyDown={e => e.key === 'Enter' && handle()} />
        <input type="password" className="al-inp" placeholder="••••••••"         value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handle()} />
        <button className="al-btn" onClick={handle} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <div className="al-err">{error}</div>
      </div>
    </div>
  )
}
