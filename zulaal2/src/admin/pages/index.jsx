// ─── DASHBOARD ────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { useStore, fmtDate } from '../../store'

function Bdg({ s }) {
  const m = { new: 'bdg-new', pending: 'bdg-pending', done: 'bdg-done', cancelled: 'bdg-cancelled' }
  return <span className={`bdg ${m[s] || 'bdg-read'}`}>{s || 'new'}</span>
}

function setPage(t, s) {
  const el1 = document.getElementById('a-title'), el2 = document.getElementById('a-sub')
  if (el1) el1.textContent = t
  if (el2) el2.textContent = s
}

export function Dashboard() {
  const quotes   = useStore(s => s.quotes)
  const messages = useStore(s => s.messages)
  useEffect(() => setPage('Dashboard', 'Welcome back — here\'s your overview.'), [])

  const newQ    = quotes.filter(q => q.status === 'new').length
  const newM    = messages.filter(m => m.status === 'new').length
  const done    = quotes.filter(q => q.status === 'done').length
  const pending = quotes.filter(q => q.status === 'pending').length

  const days   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun','Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const qVals  = [2,1,3,4,2,0,1,3,5,2,4,3,2,4]
  const mVals  = [1,0,2,1,3,1,0,2,1,3,2,1,2,1]
  const mx     = Math.max(...qVals, ...mVals) || 1

  return (
    <>
      <div className="stat-row">
        {[
          { cls:'ic-b', icon:<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></>, n:quotes.length,  l:'Quote Requests', ch:`${newQ} new`,     up:true },
          { cls:'ic-g', icon:<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>,                                                   n:messages.length, l:'Messages',       ch:`${newM} unread`, up:true },
          { cls:'ic-gold',icon:<polyline points="20 6 9 17 4 12"/>,                                                                                    n:done,            l:'Completed',      ch:'All time',       up:true },
          { cls:'ic-r', icon:<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,  n:pending,         l:'Pending',        ch:'Needs action',   up:false },
        ].map(c => (
          <div className="scard" key={c.l}>
            <div className={`scard-ico ${c.cls}`}><svg viewBox="0 0 24 24">{c.icon}</svg></div>
            <div className="scard-n">{c.n}</div>
            <div className="scard-l">{c.l}</div>
            <div className={`scard-ch ${c.up ? 'up' : 'dn'}`}>{c.ch}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="p-head"><h3>Activity — Last 14 Days</h3></div>
        <div className="chart-wrap">
          <div className="chart-leg">
            <div className="cl-i"><div className="cl-d" style={{background:'var(--shine)'}}/>Quote Requests</div>
            <div className="cl-i"><div className="cl-d" style={{background:'var(--goldlt)'}}/>Messages</div>
          </div>
          <div className="chart-bars">
            {days.map((d, i) => (
              <div className="bg" key={i}>
                <div className="bar ba" style={{height:(qVals[i]/mx*100)+'%'}} title={`Quotes: ${qVals[i]}`}/>
                <div className="bar bb" style={{height:(mVals[i]/mx*100)+'%'}} title={`Messages: ${mVals[i]}`}/>
              </div>
            ))}
          </div>
          <div className="chart-xl-row">{days.map((d,i)=><div className="chart-xl" key={i}>{d}</div>)}</div>
        </div>
      </div>

      <div className="panel">
        <div className="p-head"><h3>Recent Quote Requests</h3><span className="p-cnt">{Math.min(quotes.length, 5)} items</span></div>
        <table>
          <thead><tr><th>Name</th><th>Type</th><th>Qty</th><th>Status</th><th>Time</th></tr></thead>
          <tbody>
            {quotes.slice(0, 5).map(q => (
              <tr key={q.id}>
                <td style={{fontWeight:500}}>{q.name}</td>
                <td>{q.type}</td><td>{q.qty}</td>
                <td><Bdg s={q.status}/></td>
                <td style={{color:'rgba(226,232,240,.38)',fontSize:'.72rem'}}>{fmtDate(q.createdAt || q.ts)}</td>
              </tr>
            ))}
            {!quotes.length && <tr><td className="empty-r" colSpan={5}>No quote requests yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ─── QUOTES ────────────────────────────────────────────────────────────────────
export function Quotes() {
  const quotes            = useStore(s => s.quotes)
  const updateQuoteStatus = useStore(s => s.updateQuoteStatus)
  const deleteQuote       = useStore(s => s.deleteQuote)
  const showToast         = useStore(s => s.showToast)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [modal, setModal]   = useState(null)

  useEffect(() => setPage('Quote Requests', 'Manage all incoming quote requests.'), [])

  const doStatus = async (id, status) => {
    await updateQuoteStatus(id, status)
    showToast('Status updated', 'success')
    if (modal?.id === id) setModal(m => ({ ...m, status }))
  }
  const doDelete = async id => {
    if (!confirm('Delete this quote request?')) return
    await deleteQuote(id)
    showToast('Deleted', 'success')
    setModal(null)
  }

  const filtered = quotes.filter(q => {
    if (filter !== 'all' && q.status !== filter) return false
    if (search && !`${q.name||''}${q.email||''}${q.phone||''}`.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <>
      <div className="panel">
        <div className="p-head"><h3>All Quote Requests</h3><span className="p-cnt">{filtered.length} total</span></div>
        <div className="f-row">
          {['all','new','pending','done','cancelled'].map(f => (
            <button key={f} className={`fb${filter===f?' on':''}`} onClick={()=>setFilter(f)}>
              {f === 'all' ? 'All' : f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
          <input className="srch" placeholder="Search name / email..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <table>
          <thead><tr><th>Name</th><th>Phone</th><th>Type</th><th>Size</th><th>Qty</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(q => (
              <tr key={q.id}>
                <td style={{fontWeight:500}}>{q.name}</td>
                <td style={{color:'rgba(226,232,240,.38)'}}>{q.phone}</td>
                <td>{q.type}</td><td>{q.size}</td><td>{q.qty}</td>
                <td><Bdg s={q.status}/></td>
                <td style={{color:'rgba(226,232,240,.38)',fontSize:'.72rem',whiteSpace:'nowrap'}}>{fmtDate(q.createdAt||q.ts)}</td>
                <td style={{display:'flex',gap:'.4rem'}}>
                  <button className="abtn" onClick={()=>setModal(q)}>View</button>
                  <button className="abtn del" onClick={()=>doDelete(q.id)}>Del</button>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td className="empty-r" colSpan={8}>No records found.</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="mo" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="mo-box">
            <div className="mo-head"><h3>Quote — {modal.name}</h3><button className="mo-x" onClick={()=>setModal(null)}>×</button></div>
            <div className="mo-body">
              {[['Name',modal.name],['Phone',modal.phone],['Email',modal.email],['Type',modal.type],['Size',modal.size],['Quantity',modal.qty],['Message',modal.msg],['Received',fmtDate(modal.createdAt||modal.ts)]].map(([k,v])=>(
                <div className="mo-row" key={k}><span className="mk">{k}</span><span className="mv">{v||'—'}</span></div>
              ))}
              <div className="mo-row">
                <span className="mk">Status</span>
                <span className="mv">
                  <select className="ss" value={modal.status||'new'} onChange={e=>doStatus(modal.id,e.target.value)}>
                    {['new','pending','done','cancelled'].map(s=><option key={s}>{s}</option>)}
                  </select>
                </span>
              </div>
            </div>
            <div className="mo-acts">
              <button className="ma gr" onClick={()=>{doStatus(modal.id,'done');setModal(null)}}>Mark Done</button>
              <button className="ma" onClick={()=>window.open(`https://wa.me/${(modal.phone||'').replace(/\D/g,'')}`)}>WhatsApp</button>
              <button className="ma dr" onClick={()=>doDelete(modal.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── MESSAGES ──────────────────────────────────────────────────────────────────
export function Messages() {
  const messages       = useStore(s => s.messages)
  const markMessageRead= useStore(s => s.markMessageRead)
  const deleteMessage  = useStore(s => s.deleteMessage)
  const showToast      = useStore(s => s.showToast)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [modal, setModal]   = useState(null)

  useEffect(() => setPage('Messages', 'View and respond to customer messages.'), [])

  const open = m => { markMessageRead(m.id); setModal({...m,status:'read'}) }
  const doDelete = async id => {
    if (!confirm('Delete this message?')) return
    await deleteMessage(id)
    showToast('Deleted', 'success')
    setModal(null)
  }

  const filtered = messages.filter(m => {
    if (filter === 'new'  && m.status !== 'new')  return false
    if (filter === 'read' && m.status === 'new')   return false
    if (search && !`${m.name||''}${m.subject||''}${m.contact||''}`.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <>
      <div className="panel">
        <div className="p-head"><h3>All Messages</h3><span className="p-cnt">{filtered.length} total</span></div>
        <div className="f-row">
          {[['all','All'],['new','Unread'],['read','Read']].map(([f,l])=>(
            <button key={f} className={`fb${filter===f?' on':''}`} onClick={()=>setFilter(f)}>{l}</button>
          ))}
          <input className="srch" placeholder="Search name / subject..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <table>
          <thead><tr><th>Name</th><th>Contact</th><th>Subject</th><th>Preview</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(m=>(
              <tr key={m.id}>
                <td style={{fontWeight:500}}>{m.name}</td>
                <td style={{color:'rgba(226,232,240,.38)'}}>{m.contact}</td>
                <td>{m.subject}</td>
                <td style={{color:'rgba(226,232,240,.38)',maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.msg}</td>
                <td><span className={`bdg ${m.status==='new'?'bdg-new':'bdg-read'}`}>{m.status==='new'?'Unread':'Read'}</span></td>
                <td style={{color:'rgba(226,232,240,.38)',fontSize:'.72rem',whiteSpace:'nowrap'}}>{fmtDate(m.createdAt||m.ts)}</td>
                <td style={{display:'flex',gap:'.4rem'}}>
                  <button className="abtn" onClick={()=>open(m)}>View</button>
                  <button className="abtn del" onClick={()=>doDelete(m.id)}>Del</button>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td className="empty-r" colSpan={7}>No messages found.</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="mo" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="mo-box">
            <div className="mo-head"><h3>Message — {modal.name}</h3><button className="mo-x" onClick={()=>setModal(null)}>×</button></div>
            <div className="mo-body">
              {[['Name',modal.name],['Contact',modal.contact],['Subject',modal.subject],['Message',modal.msg],['Received',fmtDate(modal.createdAt||modal.ts)]].map(([k,v])=>(
                <div className="mo-row" key={k}><span className="mk">{k}</span><span className="mv" style={k==='Message'?{lineHeight:1.7}:{}}>{v||'—'}</span></div>
              ))}
            </div>
            <div className="mo-acts">
              <button className="ma gr" onClick={()=>setModal(null)}>Close</button>
              <button className="ma dr" onClick={()=>doDelete(modal.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── PRODUCTS ──────────────────────────────────────────────────────────────────
const PROD_LIST = [
  { id:'p1', name:'Personal 250ml/500ml', price:'Rs. 25',  active:true },
  { id:'p2', name:'Standard 1L/1.5L',    price:'Rs. 55',  active:true },
  { id:'p3', name:'Family 5L',            price:'Rs. 120', active:true },
  { id:'p4', name:'Office Dispenser 19L', price:'Rs. 350', active:true },
  { id:'p5', name:'Custom Label',         price:'Custom',  active:true },
  { id:'p6', name:'Bulk Supply',          price:'Call Us', active:true },
]

export function Products() {
  const [prods, setProds] = useState(PROD_LIST)
  const showToast = useStore(s => s.showToast)
  useEffect(() => setPage('Products', 'Manage product visibility on the public website.'), [])
  const toggle = (id, val) => { setProds(p => p.map(x => x.id === id ? {...x, active: val} : x)); showToast(val ? 'Product enabled' : 'Product hidden', 'info') }

  return (
    <>
      <div className="panel" style={{padding:'1.3rem',marginBottom:'1rem'}}>
        <h3 style={{fontSize:'.85rem',fontWeight:500,color:'#e2e8f0',marginBottom:'.4rem'}}>Product Visibility</h3>
        <p style={{fontSize:'.75rem',color:'rgba(226,232,240,.38)'}}>Toggle each product's visibility on the public website.</p>
      </div>
      <div className="pa-grid">
        {prods.map(p=>(
          <div className="pa-card" key={p.id}>
            <div className="pa-num">{p.id.toUpperCase()}</div>
            <div className="pa-nm">{p.name}</div>
            <div className="pa-pr">{p.price}</div>
            <div className="tgl-wrap">
              <label className="tgl">
                <input type="checkbox" checked={p.active} onChange={e=>toggle(p.id,e.target.checked)}/>
                <span className="tgl-sl"/>
              </label>
              <span className="tgl-lbl">{p.active ? 'Visible' : 'Hidden'}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ─── SETTINGS ──────────────────────────────────────────────────────────────────
export function Settings() {
  const showToast = useStore(s => s.showToast)
  useEffect(() => setPage('Settings', 'Configure your admin panel and brand details.'), [])

  return (
    <div className="sg">
      <div className="scard2">
        <h3>Brand Info</h3><p>Update the public-facing brand details on the website.</p>
        <label className="sl2">Brand Name</label><input className="si" defaultValue="Zulaal"/>
        <label className="sl2">Tagline</label><input className="si" defaultValue="Crystal Clear. Born Pure."/>
        <label className="sl2">Phone / WhatsApp</label><input className="si" defaultValue="+92 321 000 0000"/>
        <label className="sl2">Email</label><input className="si" defaultValue="hello@zulaal.pk"/>
        <button className="sbtn" onClick={()=>showToast('Brand settings saved','success')}>Save Changes</button>
      </div>

      <div className="scard2">
        <h3>Firebase Config</h3><p>Firebase is configured via environment variables in your <code style={{background:'rgba(255,255,255,.07)',padding:'.1rem .3rem',fontSize:'.8rem'}}>.env</code> file.</p>
        <div style={{background:'rgba(0,0,0,.3)',border:'1px solid rgba(255,255,255,.07)',padding:'1rem',marginBottom:'1rem',fontFamily:'monospace',fontSize:'.75rem',color:'rgba(226,232,240,.6)',lineHeight:1.9}}>
          <div style={{color:'var(--shine)'}}># .env</div>
          {['VITE_FIREBASE_API_KEY','VITE_FIREBASE_AUTH_DOMAIN','VITE_FIREBASE_PROJECT_ID','VITE_FIREBASE_APP_ID'].map(k=>(
            <div key={k}>{k}=<span style={{color:'rgba(226,232,240,.4)'}}>YOUR_VALUE</span></div>
          ))}
        </div>
        <button className="sbtn" onClick={()=>showToast('Edit .env file and restart the dev server','info')}>View Guide</button>
      </div>

      <div className="scard2">
        <h3>Admin Access Control</h3><p>The admin panel route is controlled entirely by your <code style={{background:'rgba(255,255,255,.07)',padding:'.1rem .3rem',fontSize:'.8rem'}}>.env</code> file.</p>
        <div style={{background:'rgba(0,0,0,.3)',border:'1px solid rgba(255,255,255,.07)',padding:'1rem',marginBottom:'1rem',fontFamily:'monospace',fontSize:'.75rem',lineHeight:1.9}}>
          <div style={{color:'rgba(226,232,240,.4)'}}># Enable admin panel</div>
          <div>VITE_ALLOW_ADMIN=<span style={{color:'var(--green)'}}>true</span></div>
          <div style={{marginTop:'.5rem',color:'rgba(226,232,240,.4)'}}># Disable (redirects /admin → /)</div>
          <div>VITE_ALLOW_ADMIN=<span style={{color:'var(--red)'}}>false</span></div>
        </div>
        <p style={{fontSize:'.75rem',color:'rgba(226,232,240,.38)',lineHeight:1.7}}>When disabled, the <code style={{color:'var(--shine)'}}>/admin</code> route is completely invisible. No 404, no login page — it simply redirects to the homepage.</p>
      </div>

      <div className="scard2">
        <h3>Notifications</h3><p>Configure where you receive order notifications.</p>
        <label className="sl2">Notification Email</label><input className="si" placeholder="admin@zulaal.pk"/>
        <div style={{display:'flex',alignItems:'center',gap:'.7rem',marginBottom:'1rem'}}>
          <label className="tgl"><input type="checkbox" defaultChecked/><span className="tgl-sl"/></label>
          <span style={{fontSize:'.75rem',color:'rgba(226,232,240,.38)'}}>Send WhatsApp on new order</span>
        </div>
        <button className="sbtn" onClick={()=>showToast('Notification settings saved','success')}>Save</button>
      </div>
    </div>
  )
}

export default Dashboard
