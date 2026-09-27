import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
} from 'firebase/auth'
import {
  collection, query, orderBy, onSnapshot,
  doc, updateDoc, deleteDoc, addDoc, serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from './firebase'

// ─── DEMO DATA (shown when Firebase not yet configured) ───────────────────────
const DEMO_QUOTES = [
  { id:'dq1', name:'Ahmed Khan',  phone:'+92 300 1234567', email:'ahmed@co.pk',          type:'Custom Label Bottles', size:'500ml',   qty:'1000', msg:'For our product launch.',        status:'new',     ts: Date.now()-3600000   },
  { id:'dq2', name:'Sara Ali',    phone:'+92 321 9876543', email:'sara@events.pk',        type:'Wedding / Event',      size:'250ml',   qty:'500',  msg:'Wedding on Dec 15th.',           status:'pending', ts: Date.now()-86400000  },
  { id:'dq3', name:'Bilal Corp',  phone:'+92 333 5555555', email:'orders@bilalcorp.pk',   type:'Corporate Supply',     size:'19 Litre',qty:'50',   msg:'Weekly office supply.',          status:'done',    ts: Date.now()-172800000 },
  { id:'dq4', name:'Hina Aslam',  phone:'+92 311 0000111', email:'hina@hotel.pk',         type:'Office Dispensers',    size:'19 Litre',qty:'20',   msg:'Hotel lobby water station.',     status:'new',     ts: Date.now()-900000    },
]
const DEMO_MSGS = [
  { id:'dm1', name:'Fatima Sheikh',contact:'fatima@gmail.com',  subject:'Pricing & Bulk',  msg:'Bulk discount for 5000 bottles?',                  status:'new',  ts: Date.now()-1800000  },
  { id:'dm2', name:'Usman Ltd',    contact:'+92 311 0000000',   subject:'Partnership',     msg:'Interested in a distribution partnership.',         status:'read', ts: Date.now()-43200000 },
  { id:'dm3', name:'Nadia Zafar',  contact:'nadia@brand.pk',    subject:'Custom Order',    msg:'Need 2000 custom bottles for our brand relaunch.',  status:'new',  ts: Date.now()-7200000  },
]

// helper: normalize a Firestore doc (has .toDate) or a demo item (has .ts)
export function fmtDate(raw) {
  if (!raw) return '—'
  try {
    const d = raw.toDate ? raw.toDate() : new Date(raw)
    return d.toLocaleDateString('en-PK', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })
  } catch { return '—' }
}

// ─── STORE ───────────────────────────────────────────────────────────────────
export const useStore = create(
  subscribeWithSelector((set, get) => ({

    // ── AUTH slice ──────────────────────────────────────────────────────────
    user:        null,
    authLoading: true,

    initAuth() {
      if (!auth) { set({ authLoading: false }); return () => {} }
      return onAuthStateChanged(auth, user => set({ user, authLoading: false }))
    },
    async login(email, password) {
      if (!auth) throw new Error('Firebase not configured — add keys to .env')
      await signInWithEmailAndPassword(auth, email, password)
    },
    async logout() {
      if (!auth) { set({ user: null }); return }
      await signOut(auth)
    },

    // ── DATA slices ─────────────────────────────────────────────────────────
    quotes:     DEMO_QUOTES,
    messages:   DEMO_MSGS,
    dataLoaded: false,
    _unsubs:    [],

    /** Call once after login to stream live data */
    subscribeData() {
      if (!db) return            // stay on demo data
      if (get().dataLoaded) return

      const u1 = onSnapshot(
        query(collection(db, 'quote_requests'), orderBy('createdAt', 'desc')),
        snap => set({ quotes: snap.docs.map(d => ({ id: d.id, ...d.data() })) })
      )
      const u2 = onSnapshot(
        query(collection(db, 'messages'), orderBy('createdAt', 'desc')),
        snap => set({ messages: snap.docs.map(d => ({ id: d.id, ...d.data() })) })
      )
      set({ dataLoaded: true, _unsubs: [u1, u2] })
    },

    unsubscribeData() {
      get()._unsubs.forEach(u => u())
      set({ dataLoaded: false, _unsubs: [], quotes: DEMO_QUOTES, messages: DEMO_MSGS })
    },

    // ── Quote actions ───────────────────────────────────────────────────────
    async updateQuoteStatus(id, status) {
      set(s => ({ quotes: s.quotes.map(q => q.id === id ? { ...q, status } : q) }))
      if (!db) return
      try { await updateDoc(doc(db, 'quote_requests', id), { status }) } catch (e) { console.error(e) }
    },
    async deleteQuote(id) {
      set(s => ({ quotes: s.quotes.filter(q => q.id !== id) }))
      if (!db) return
      try { await deleteDoc(doc(db, 'quote_requests', id)) } catch (e) { console.error(e) }
    },

    // ── Message actions ─────────────────────────────────────────────────────
    async markMessageRead(id) {
      set(s => ({ messages: s.messages.map(m => m.id === id ? { ...m, status:'read' } : m) }))
      if (!db) return
      try { await updateDoc(doc(db, 'messages', id), { status:'read' }) } catch (e) { console.error(e) }
    },
    async deleteMessage(id) {
      set(s => ({ messages: s.messages.filter(m => m.id !== id) }))
      if (!db) return
      try { await deleteDoc(doc(db, 'messages', id)) } catch (e) { console.error(e) }
    },

    // ── Form submission (public site) ───────────────────────────────────────
    async submitQuote(data) {
      if (!db) { await delay(700); return }
      await addDoc(collection(db, 'quote_requests'), { ...data, status:'new', createdAt: serverTimestamp() })
    },
    async submitMessage(data) {
      if (!db) { await delay(700); return }
      await addDoc(collection(db, 'messages'), { ...data, status:'new', createdAt: serverTimestamp() })
    },

    // ── Toast (admin) ───────────────────────────────────────────────────────
    toast: null,
    showToast(msg, type = 'info') {
      set({ toast: { msg, type } })
      setTimeout(() => set({ toast: null }), 3200)
    },
  }))
)

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }
