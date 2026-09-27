import { useEffect, useRef, useState, useCallback } from 'react'
import { useStore } from '../store'
import * as THREE from 'three'

// ─── Loader ──────────────────────────────────────────────────────────────────
function Loader() {
  const [pct, setPct] = useState(0)
  const [gone, setGone] = useState(false)
  useEffect(() => {
    let p = 0
    const t = setInterval(() => {
      p += Math.random() * 14 + 3
      if (p >= 100) { p = 100; clearInterval(t); setTimeout(() => setGone(true), 350) }
      setPct(Math.floor(Math.min(p, 100)))
    }, 55)
    return () => clearInterval(t)
  }, [])
  return (
    <div className={`loader${gone ? ' gone' : ''}`}>
      <div className="loader-logo">Zul<span>aa</span>l</div>
      <div className="loader-drop">💧</div>
      <div className="loader-bar"><div className="loader-fill" style={{ width: pct + '%' }} /></div>
      <div className="loader-pct">{pct}%</div>
    </div>
  )
}

// ─── Cursor ───────────────────────────────────────────────────────────────────
function useCursor() {
  useEffect(() => {
    const c1 = document.getElementById('c1'), c2 = document.getElementById('c2')
    if (!c1 || !c2) return
    let mx = 0, my = 0, rx = 0, ry = 0, raf
    const move = e => { mx = e.clientX; my = e.clientY; c1.style.left = mx + 'px'; c1.style.top = my + 'px' }
    const loop = () => { rx += (mx - rx) * .09; ry += (my - ry) * .09; c2.style.left = rx + 'px'; c2.style.top = ry + 'px'; raf = requestAnimationFrame(loop) }
    document.addEventListener('mousemove', move); loop()
    const els = document.querySelectorAll('a,button,.pc,.tcard,.city,.pill,.perk,.soc,.cdt,.fcard')
    els.forEach(el => { el.addEventListener('mouseenter', () => document.body.classList.add('cur-big')); el.addEventListener('mouseleave', () => document.body.classList.remove('cur-big')) })
    return () => { document.removeEventListener('mousemove', move); cancelAnimationFrame(raf) }
  }, [])
}

// ─── Three.js ─────────────────────────────────────────────────────────────────
function useThree() {
  useEffect(() => {
    const canvas = document.getElementById('cvs')
    if (!canvas || !THREE) return
    const R = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    R.setPixelRatio(Math.min(devicePixelRatio, 2))
    R.setSize(innerWidth, innerHeight)
    R.setClearColor(0, 0)
    const scene = new THREE.Scene()
    const cam = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, .1, 1000)
    cam.position.set(0, 0, 5)
    const resize = () => { cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); R.setSize(innerWidth, innerHeight) }
    window.addEventListener('resize', resize)

    const mkMesh = (geo, mat) => new THREE.Mesh(geo, mat)
    const sph = mkMesh(new THREE.SphereGeometry(1.8, 64, 64), new THREE.MeshStandardMaterial({ color: 0x0a3d6b, metalness: .15, roughness: .06, transparent: true, opacity: .55 }))
    sph.position.set(3.2, -.2, 0); scene.add(sph)
    const wSph = mkMesh(new THREE.SphereGeometry(1.82, 32, 32), new THREE.MeshBasicMaterial({ color: 0x14a8e0, wireframe: true, transparent: true, opacity: .038 }))
    wSph.position.copy(sph.position); scene.add(wSph)
    const iSph = mkMesh(new THREE.SphereGeometry(1.75, 32, 32), new THREE.MeshBasicMaterial({ color: 0x0e6aad, transparent: true, opacity: .14, side: THREE.BackSide }))
    iSph.position.copy(sph.position); scene.add(iSph)
    const t1 = mkMesh(new THREE.TorusGeometry(2.4, .01, 8, 80), new THREE.MeshBasicMaterial({ color: 0x14a8e0, transparent: true, opacity: .07, wireframe: true }))
    t1.position.copy(sph.position); t1.rotation.x = Math.PI / 3; scene.add(t1)
    const t2 = mkMesh(new THREE.TorusGeometry(2.7, .008, 8, 80), new THREE.MeshBasicMaterial({ color: 0xb8924a, transparent: true, opacity: .05, wireframe: true }))
    t2.position.copy(sph.position); t2.rotation.x = Math.PI / 2; t2.rotation.y = Math.PI / 5; scene.add(t2)
    const ico = mkMesh(new THREE.IcosahedronGeometry(1.1, 1), new THREE.MeshStandardMaterial({ color: 0x0e6aad, metalness: .2, roughness: .1, transparent: true, opacity: .18 }))
    ico.position.set(-3.5, 1.2, -1); scene.add(ico)
    const icoW = mkMesh(new THREE.IcosahedronGeometry(1.13, 1), new THREE.MeshBasicMaterial({ color: 0x14a8e0, wireframe: true, transparent: true, opacity: .09 }))
    icoW.position.copy(ico.position); scene.add(icoW)
    const cpos = [[2.5, 2.2, -2], [-4, -1.5, -1], [4.5, -2, -2], [-2.5, 2.5, -1.5], [0, -3, -2]]
    const crystals = cpos.map((p, i) => {
      const m = mkMesh(new THREE.OctahedronGeometry(.15 + Math.random() * .25, 0), new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0x14a8e0 : 0xb8924a, metalness: .3, roughness: .2, transparent: true, opacity: .3 + Math.random() * .3 }))
      m.position.set(...p); m.userData = { ph: Math.random() * Math.PI * 2, sp: .4 + Math.random() * .4 }; scene.add(m); return m
    })
    const pN = 1200, pP = new Float32Array(pN * 3), pC = new Float32Array(pN * 3)
    for (let i = 0; i < pN; i++) {
      const r = 4 + Math.random() * 8, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1)
      pP[i * 3] = r * Math.sin(ph) * Math.cos(th); pP[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * (.6 * Math.random() + .4); pP[i * 3 + 2] = r * Math.cos(ph)
      const g = Math.random() > .82; pC[i * 3] = g ? .72 : .05; pC[i * 3 + 1] = g ? .57 : .66; pC[i * 3 + 2] = g ? .29 : .88
    }
    const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute('position', new THREE.BufferAttribute(pP, 3)); pGeo.setAttribute('color', new THREE.BufferAttribute(pC, 3))
    const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: .024, vertexColors: true, transparent: true, opacity: .68, sizeAttenuation: true })); scene.add(pts)
    const p2P = new Float32Array(400 * 3); for (let j = 0; j < 400; j++) { p2P[j * 3] = (Math.random() - .5) * 16; p2P[j * 3 + 1] = (Math.random() - .5) * 10; p2P[j * 3 + 2] = (Math.random() - .5) * 8 }
    const p2G = new THREE.BufferGeometry(); p2G.setAttribute('position', new THREE.BufferAttribute(p2P, 3))
    const pts2 = new THREE.Points(p2G, new THREE.PointsMaterial({ size: .016, color: 0x14a8e0, transparent: true, opacity: .22, sizeAttenuation: true })); scene.add(pts2)
    scene.add(new THREE.AmbientLight(0x0a1628, .85))
    const pl1 = new THREE.PointLight(0x14a8e0, 2.5, 12); pl1.position.set(2, 2, 3); scene.add(pl1)
    const pl2 = new THREE.PointLight(0xb8924a, 1.2, 8); pl2.position.set(-3, -1, 2); scene.add(pl2)
    const pl3 = new THREE.PointLight(0x0e6aad, 1.8, 10); pl3.position.set(0, 3, -2); scene.add(pl3)
    let scY = 0, mX = 0, mY = 0, tX = 0, tY = 0
    window.addEventListener('scroll', () => scY = window.scrollY)
    document.addEventListener('mousemove', e => { mX = (e.clientX / innerWidth - .5) * 2; mY = -(e.clientY / innerHeight - .5) * 2 })
    let tt = 0, rafId
    const animate = () => {
      rafId = requestAnimationFrame(animate); tt += .008
      tX += (mX * .3 - tX) * .05; tY += (mY * .2 - tY) * .05
      sph.rotation.y = tt * .18 + tX * .4; sph.rotation.x = Math.sin(tt * .12) * .06 + tY * .2; sph.position.y = -.2 + Math.sin(tt * .6) * .08
      wSph.rotation.copy(sph.rotation); wSph.position.y = sph.position.y; iSph.rotation.y = sph.rotation.y * .8; iSph.position.y = sph.position.y
      t1.rotation.z = tt * .12; t1.rotation.x = Math.PI / 3 + Math.sin(tt * .2) * .1; t2.rotation.z = -tt * .08; t2.rotation.y = tt * .1
      ico.rotation.x = tt * .2; ico.rotation.y = tt * .15; ico.position.y = 1.2 + Math.sin(tt * .5) * .15
      icoW.rotation.copy(ico.rotation); icoW.position.copy(ico.position)
      crystals.forEach(c => { c.rotation.x += .008; c.rotation.y += .006; c.position.y += Math.sin(tt + c.userData.ph) * c.userData.sp * .003 })
      pts.rotation.y = tt * .018; pts.rotation.x = tt * .006; pts2.rotation.y = -tt * .012
      const sp = scY * .0008; cam.position.y = -sp * 1.5; sph.position.x = 3.2 - sp * .5; ico.position.x = -3.5 + sp * .3
      pl1.position.x = 2 + Math.sin(tt * .4) * 1.5; pl1.position.y = 2 + Math.cos(tt * .3); pl2.position.x = -3 + Math.cos(tt * .35)
      R.render(scene, cam)
    }
    animate()
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); R.dispose() }
  }, [])
}

// ─── Reveal on scroll ─────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('on') }), { threshold: .07 })
    document.querySelectorAll('.rv,.rvl,.rvr').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

// ─── Card tilt ────────────────────────────────────────────────────────────────
function useCardTilt() {
  useEffect(() => {
    const hs = []
    document.querySelectorAll('.pc').forEach(card => {
      const mm = e => {
        const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5
        card.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 9}deg) translateZ(8px)`
        card.style.setProperty('--px', (x + .5) * 100 + '%'); card.style.setProperty('--py', (y + .5) * 100 + '%')
      }
      const ml = () => { card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)' }
      card.addEventListener('mousemove', mm); card.addEventListener('mouseleave', ml); hs.push({ card, mm, ml })
    })
    return () => hs.forEach(({ card, mm, ml }) => { card.removeEventListener('mousemove', mm); card.removeEventListener('mouseleave', ml) })
  }, [])
}

// ─── Water fill scroll sections ───────────────────────────────────────────────
function useWaterFill() {
  useEffect(() => {
    const sections = document.querySelectorAll('.wf-section')
    const io = new IntersectionObserver(es => es.forEach(e => {
      const wave = e.target.querySelector('.wf-wave')
      if (!wave) return
      if (e.isIntersecting) {
        setTimeout(() => wave.classList.add('filled'), 100)
      }
    }), { threshold: .2 })
    sections.forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [])
}

// ─── Nav scroll ───────────────────────────────────────────────────────────────
function useNavScroll() {
  useEffect(() => {
    const nav = document.getElementById('main-nav')
    if (!nav) return
    const fn = () => nav.classList.toggle('stuck', window.scrollY > 70)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
}

// ─── 3D CSS Bottle (hero right panel) ────────────────────────────────────────
function Bottle3D() {
  const bubbles = Array.from({ length: 6 }, (_, i) => ({
    id: i, size: 3 + Math.random() * 5, left: 18 + Math.random() * 60,
    duration: 3 + Math.random() * 4, delay: Math.random() * 3
  }))
  const rings = [{ s: 260, d: 0 }, { s: 340, d: 1.5 }, { s: 420, d: 3 }]
  const drops = Array.from({ length: 5 }, (_, i) => ({
    id: i, size: 4 + Math.random() * 5,
    left: 10 + Math.random() * 80, top: 10 + Math.random() * 80,
    dur: 2 + Math.random() * 3, delay: Math.random() * 4
  }))

  return (
    <div className="bottle-scene">
      {/* Ambient rings */}
      {rings.map(r => (
        <div key={r.s} className="bottle-ring" style={{ width: r.s, height: r.s, animationDelay: r.d + 's', animationDuration: '5s' }} />
      ))}

      <div className="bottle-stage">
        <div className="bottle-3d">
          <div className="bottle-cap" />
          <div className="bottle-neck" />
          <div className="bottle-body">
            <div className="bottle-water-fill" />
            <div className="bottle-shine" />
            <div className="bottle-shine2" />
            <div className="bottle-label-wrap">
              <span className="bottle-label-brand">Zulaal</span>
              <div className="bottle-label-line" />
              <span className="bottle-label-sub">Pure · Natural · Pakistan</span>
            </div>
            {/* Bubbles */}
            {bubbles.map(b => (
              <div key={b.id} className="bubble" style={{ width: b.size, height: b.size, left: b.left + '%', bottom: Math.random() * 40 + '%', animationDuration: b.duration + 's', animationDelay: b.delay + 's' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Water drops around bottle */}
      <div className="bottle-drops">
        {drops.map(d => (
          <div key={d.id} className="bdrop" style={{ width: d.size, height: d.size * 1.6, left: d.left + '%', top: d.top + '%', animationDuration: d.dur + 's', animationDelay: d.delay + 's' }} />
        ))}
      </div>
    </div>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav className="nav" id="main-nav">
      <a href="#" className="nav-logo">Zul<em>aa</em>l<span className="nav-drop" /></a>
      <ul className="nav-links">
        <li><a href="#about">Story</a></li>
        <li><a href="#products">Products</a></li>
        <li><a href="#custom">Custom</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <button className="nav-btn" onClick={() => document.getElementById('custom')?.scrollIntoView({ behavior: 'smooth' })}>Order Now</button>
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-content">
        <div className="hero-pre"><div className="hero-pre-line" /><span className="hero-pre-txt">Pakistan's Premium Water Brand</span></div>
        <h1 className="hero-title">Zul<b>aa</b>l<span className="it">Crystal Clear. Born Pure.</span></h1>
        <p className="hero-body">From bespoke custom-labeled bottles for your most important moments, to pure drinking water delivered across Pakistan — crafted with care in every drop.</p>
        <div className="hero-btns">
          <a href="#products" className="btn-p">Explore Products</a>
          <button className="btn-g" onClick={() => document.getElementById('custom')?.scrollIntoView({ behavior: 'smooth' })}>Custom Bottles →</button>
        </div>
      </div>
      <Bottle3D />
      <div className="hero-scroll"><span>Scroll</span><div className="hero-scroll-line" /></div>
    </section>
  )
}

// ─── Marquee ──────────────────────────────────────────────────────────────────
const MQ_ITEMS = ['Pure Water','Custom Branding','Corporate Supply','Wedding Bottles','PSQCA Certified','7-Stage RO Filter','Same-Day Delivery','Office Dispensers','Event Packages','Bulk Orders']
function Marquee() {
  const items = [...MQ_ITEMS, ...MQ_ITEMS]
  return (
    <div className="marquee">
      <div className="marquee-inner">
        {items.flatMap((t, i) => [
          <span key={`t${i}`} className="marq-t">{t}</span>,
          <span key={`d${i}`} className="marq-d">·</span>
        ])}
      </div>
    </div>
  )
}

// ─── About ────────────────────────────────────────────────────────────────────
function About() {
  const [fillW, setFillW] = useState(0)
  useEffect(() => {
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) setTimeout(() => setFillW(99.8), 400) }, { threshold: .3 })
    const el = document.getElementById('about'); if (el) io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <section className="sec wf-section" id="about">
      <div className="wf-bg"><div className="wf-wave" style={{ height: '40%' }} /></div>
      <div className="sec-in">
        <div className="about-grid">
          <div className="about-vis rvl">
            {[400, 480, 560].map((s, i) => <div key={s} className="ring-d" style={{ width: s, height: s, animationDelay: `${-i * 1.5}s` }} />)}
            <div className="sphere-wrap">
              <div className="sl sl1"><div className="sgl" /><div className="slbl">Zulaal</div></div>
              <div className="sl sl2" /><div className="sl sl3" />
            </div>
            <div className="fcard fca"><div className="n">99.8%</div><div className="l">Purity Score</div></div>
            <div className="fcard fcb"><div className="n">500K+</div><div className="l">Bottles Delivered</div></div>
            <div className="fcard fcc"><div className="n">18</div><div className="l">Cities Covered</div></div>
          </div>
          <div className="rvr">
            <div className="eyebrow"><div className="ey-line" /><span className="ey-txt">Our Story</span></div>
            <h2 className="stit" style={{ marginTop: '.8rem' }}>Water as it was<br /><em>meant</em> to be</h2>
            <div className="wfill-bar"><div className="wfill-inner" style={{ width: fillW + '%' }} /></div>
            <p className="about-txt">Zulaal — meaning crystal-clear water in Arabic — was born from a simple belief: every Pakistani deserves water that is genuinely, verifiably pure. Not just labelled pure. Actually pure.</p>
            <p className="about-txt">We hold ourselves to the highest standard. Quarterly PCRWR testing. 7-stage reverse osmosis purification. A custom bottle service that turns hydration into a statement.</p>
            <div className="pillars">
              {[['7-Stage RO', 'Multi-layer reverse osmosis + UV sterilisation.'], ['Custom Labels', 'Your design printed and delivered in 72 hours.'], ['PSQCA Registered', 'Quarterly government quality monitoring passed.'], ['Nationwide', 'Same-day delivery across 18 major cities.']].map(([t, d]) => (
                <div className="pill" key={t}><div className="pill-t">{t}</div><div className="pill-d">{d}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Products ─────────────────────────────────────────────────────────────────
const PRODS = [
  { n: '01', name: 'Personal', size: '250ml — 500ml', desc: 'Slim and lightweight. Your everyday companion for school, gym, and commute.', price: 'Rs. 25', unit: 'per bottle', icon: <path d="M12 2C9 2 7 5 7 9v10a2 2 0 004 0v-4h2v4a2 2 0 004 0V9c0-4-2-7-5-7z" /> },
  { n: '02', name: 'Standard', size: '1 Litre — 1.5 Litre', desc: 'Our flagship. Ideal for home, travel, dining tables and daily family use.', price: 'Rs. 55', unit: 'per bottle', badge: 'Best Seller', featured: true, icon: <path d="M12 2C9 2 7 5 7 9v10a2 2 0 004 0v-4h2v4a2 2 0 004 0V9c0-4-2-7-5-7z" /> },
  { n: '03', name: 'Family', size: '5 Litre', desc: 'Easy-grip handle, resealable cap. The household companion that lasts all day.', price: 'Rs. 120', unit: 'per bottle', icon: <><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M9 3V1h6v2" /></> },
  { n: '04', name: 'Office Dispenser', size: '19 Litre', desc: 'Built for offices, schools, and restaurants. Weekly subscription available.', price: 'Rs. 350', unit: 'per jar', icon: <><rect x="5" y="2" width="14" height="20" rx="2" /><circle cx="12" cy="14" r="3" /><path d="M10 6h4" /></> },
  { n: '05', name: 'Custom Label', size: 'Any Size', desc: 'Your logo, your colors, your event. Min 200 bottles. Free design service.', price: 'Custom', unit: 'pricing', badge: 'Popular', icon: <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" /> },
  { n: '06', name: 'Bulk Supply', size: '500+ Units', desc: 'Dedicated account manager and flexible delivery scheduling for large businesses.', price: 'Call Us', unit: 'for rates', icon: <><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" /><path d="M12 12v.01M8 12v.01M16 12v.01" /></> },
]

function BottleMark() {
  return (
    <svg className="pc-bottle-mark" width="80" height="200" viewBox="0 0 100 250" fill="currentColor">
      <rect x="35" y="0" width="30" height="18" rx="3" /><rect x="28" y="16" width="44" height="10" rx="2" />
      <path d="M22 26 Q18 46 18 76 L18 216 Q18 236 50 236 Q82 236 82 216 L82 76 Q82 46 78 26 Z" />
    </svg>
  )
}

function Products() {
  const delays = ['d1', 'd2', 'd3', 'd1', 'd2', 'd3']
  return (
    <section className="sec wf-section" id="products" style={{ background: 'linear-gradient(to bottom,var(--void),rgba(4,22,36,.35),var(--void))' }}>
      <div className="wf-bg"><div className="wf-wave" style={{ height: '60%' }} /></div>
      <div className="sec-in">
        <div className="rv" style={{ textAlign: 'center', maxWidth: 580, margin: '0 auto 5rem' }}>
          <div className="eyebrow" style={{ justifyContent: 'center' }}><div className="ey-line" /><span className="ey-txt">Our Range</span><div className="ey-line" /></div>
          <h2 className="stit" style={{ marginTop: '.9rem' }}>Every size.<br /><em>Every need.</em></h2>
          <p style={{ fontSize: '.86rem', color: 'rgba(200,234,249,.38)', lineHeight: 1.8, marginTop: '.9rem', fontWeight: 300 }}>From personal carry bottles to 19-litre office dispensers — and fully custom-branded options for your brand or event.</p>
        </div>
        <div className="products-grid">
          {PRODS.map((p, i) => (
            <div key={p.n} className={`pc rv ${delays[i]}${p.featured ? ' feat' : ''}`}>
              {p.badge && <div className="pbadge">{p.badge}</div>}
              <div className="num">{p.n}</div>
              <div className="ico"><svg viewBox="0 0 24 24">{p.icon}</svg></div>
              <div className="pname">{p.name}</div>
              <div className="psize">{p.size}</div>
              <div className="pdesc">{p.desc}</div>
              <div className="pprice">{p.price}<small>{p.unit}</small></div>
              <div className="pbar" />
              <BottleMark />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Custom Order Form ────────────────────────────────────────────────────────
function CustomOrder() {
  const submitQuote = useStore(s => s.submitQuote)
  const [f, setF] = useState({ name: '', phone: '', email: '', type: 'Custom Label Bottles', size: '1 Litre', qty: '', msg: '' })
  const [btn, setBtn] = useState('Submit Quote Request')
  const [status, setStatus] = useState({ msg: '', color: '' })
  const up = k => e => setF(prev => ({ ...prev, [k]: e.target.value }))

  const submit = async () => {
    if (!f.name || !f.phone) { setStatus({ msg: 'Please fill in your name and phone.', color: 'var(--red)' }); return }
    setBtn('Sending...')
    try { await submitQuote(f); setBtn('Request Sent ✓'); setStatus({ msg: 'We will contact you within 2 hours. Thank you!', color: 'var(--green)' }) }
    catch { setBtn('Submit Quote Request'); setStatus({ msg: 'Error — please call us directly.', color: 'var(--red)' }) }
  }

  return (
    <section className="sec" id="custom">
      <div className="sec-in">
        <div className="custom-grid">
          <div className="rvl">
            <div className="eyebrow"><div className="ey-line" /><span className="ey-txt">Custom Orders</span></div>
            <h2 className="stit" style={{ marginTop: '.8rem' }}>Your brand.<br /><em>Our water.</em></h2>
            <p style={{ fontSize: '.86rem', color: 'rgba(200,234,249,.4)', lineHeight: 1.9, marginTop: '1.4rem', fontWeight: 300 }}>Perfect for weddings, corporate events, product launches, hotels, and restaurants. We print your design and deliver bottles that leave a lasting impression.</p>
            <div className="csteps">
              {[['01', 'Submit Your Design', 'Send your logo and artwork — or let our design team create it for you, completely free.'], ['02', 'Approve the Proof', 'Digital mockup within 24 hours. You approve, we go straight to production.'], ['03', 'Receive Your Order', 'Branded bottles delivered to your address within 72 hours of final approval.']].map(([n, t, d]) => (
                <div className="cstep" key={n}><div className="csn">{n}</div><div><div className="cst">{t}</div><div className="csd">{d}</div></div></div>
              ))}
            </div>
            <div className="perks">{['Min. 200 bottles', 'Full-wrap printing', '72hr turnaround', 'Free design', 'All sizes', 'Nationwide delivery'].map(p => <span className="perk" key={p}>{p}</span>)}</div>
          </div>
          <div className="fglass rvr">
            <span className="fey">Request a Quote</span>
            <div className="frow"><div><label className="fl">Full Name</label><input className="fi" placeholder="Ahmed Khan" value={f.name} onChange={up('name')} /></div><div><label className="fl">Phone</label><input className="fi" placeholder="+92 300 0000000" value={f.phone} onChange={up('phone')} /></div></div>
            <label className="fl">Email</label><input className="fi" placeholder="you@company.com" value={f.email} onChange={up('email')} />
            <label className="fl">Order Type</label>
            <select className="fsl" value={f.type} onChange={up('type')}>{['Custom Label Bottles', 'Corporate Supply', 'Wedding / Event', 'Office Dispensers', 'Retail Bulk Order'].map(o => <option key={o}>{o}</option>)}</select>
            <div className="frow"><div><label className="fl">Bottle Size</label><select className="fsl" value={f.size} onChange={up('size')}>{['250ml', '500ml', '1 Litre', '1.5 Litre', '5 Litre', '19 Litre'].map(o => <option key={o}>{o}</option>)}</select></div><div><label className="fl">Quantity</label><input className="fi" type="number" placeholder="500" value={f.qty} onChange={up('qty')} /></div></div>
            <label className="fl">Requirements</label><textarea className="fta" placeholder="Event date, deadline, requirements..." value={f.msg} onChange={up('msg')} />
            <button className="fsub" onClick={submit}><span className="fsub-t">{btn}</span></button>
            {status.msg && <div className="fstat" style={{ color: status.color }}>{status.msg}</div>}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIS = [
  { av: 'SA', text: '"We ordered 2,000 custom-labeled bottles for our product launch. The quality was stunning and delivery was perfectly on time. Every guest was genuinely impressed."', name: 'Sara Akhtar', role: 'Marketing Director, Karachi' },
  { av: 'MR', text: '"Six months of office supply and not a single missed delivery. 19-litre jars every Monday without exception. Genuinely the best water service in Lahore."', name: 'Muhammad Raza', role: 'Office Manager, Lahore' },
  { av: 'FQ', text: '"The custom bottles for my daughter\'s wedding were absolutely beautiful. The team was so patient and the final result exceeded all of our expectations."', name: 'Fatima Qureshi', role: 'Event Host, Islamabad' },
]
function Testimonials() {
  return (
    <section className="sec" id="testimonials" style={{ background: 'linear-gradient(135deg,rgba(4,22,36,.5) 0%,var(--void) 100%)' }}>
      <div className="sec-in">
        <div className="rv" style={{ textAlign: 'center' }}>
          <div className="eyebrow" style={{ justifyContent: 'center' }}><div className="ey-line" /><span className="ey-txt">Testimonials</span><div className="ey-line" /></div>
          <h2 className="stit" style={{ marginTop: '.9rem' }}>Trusted by <em>thousands</em></h2>
        </div>
        <div className="tgrid">
          {TESTIS.map((t, i) => (
            <div className={`tcard rv d${i + 1}`} key={t.name}>
              <div className="tstars">★★★★★</div>
              <p className="ttext">{t.text}</p>
              <div className="tauth"><div className="tav">{t.av}</div><div><div className="tnm">{t.name}</div><div className="trl">{t.role}</div></div></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Coverage ─────────────────────────────────────────────────────────────────
const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Hyderabad', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Sukkur', 'Bahawalpur', 'Abbottabad', 'Larkana', 'Sahiwal', 'Mirpur AJK', 'Gilgit']
function Coverage() {
  return (
    <section className="sec wf-section" id="coverage" style={{ textAlign: 'center' }}>
      <div className="wf-bg"><div className="wf-wave" style={{ height: '50%' }} /></div>
      <div className="sec-in">
        <div className="rv"><div className="eyebrow" style={{ justifyContent: 'center' }}><div className="ey-line" /><span className="ey-txt">Delivery Network</span><div className="ey-line" /></div><h2 className="stit" style={{ marginTop: '.9rem' }}>We deliver <em>everywhere</em></h2></div>
        <div className="cnums rv">{[['18', 'Cities Covered'], ['500K+', 'Deliveries Done'], ['2,400+', 'Active Clients'], ['4.9★', 'Customer Rating']].map(([n, l]) => <div key={l}><div className="cn-n">{n}</div><div className="cn-l">{l}</div></div>)}</div>
        <div className="cities rv">{CITIES.map(c => <span className="city" key={c}>{c}</span>)}</div>
      </div>
    </section>
  )
}

// ─── Contact ─────────────────────────────────────────────────────────────────
function Contact() {
  const submitMessage = useStore(s => s.submitMessage)
  const [f, setF] = useState({ name: '', contact: '', subject: 'General Inquiry', msg: '' })
  const [btn, setBtn] = useState('Send Message')
  const [status, setStatus] = useState({ msg: '', color: '' })
  const up = k => e => setF(prev => ({ ...prev, [k]: e.target.value }))

  const submit = async () => {
    if (!f.name || !f.contact) { setStatus({ msg: 'Please fill in name and contact.', color: 'var(--red)' }); return }
    setBtn('Sending...')
    try { await submitMessage(f); setBtn('Sent ✓'); setStatus({ msg: 'We will get back to you within 2 hours!', color: 'var(--green)' }) }
    catch { setBtn('Send Message'); setStatus({ msg: 'Error — please email us directly.', color: 'var(--red)' }) }
  }

  return (
    <section className="sec" id="contact">
      <div className="sec-in">
        <div className="ctgrid">
          <div className="rvl">
            <div className="eyebrow"><div className="ey-line" /><span className="ey-txt">Get In Touch</span></div>
            <h2 className="stit" style={{ marginTop: '.8rem' }}>Let's talk <em>water.</em></h2>
            <div className="ctinf">
              <p>Questions about pricing, custom orders, or bulk supply? Our team responds within 2 hours during business hours.</p>
            </div>
            {[
              { icon: <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 010 1.17 2 2 0 012 .01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />, l: 'Phone / WhatsApp', v: '+92 321 000 0000' },
              { icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>, l: 'Email', v: 'hello@zulaal.pk' },
              { icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></>, l: 'Head Office', v: 'Karachi, Pakistan' },
            ].map(d => (
              <div className="cdt" key={d.l}><div className="cdt-ico"><svg viewBox="0 0 24 24" style={{ width: 15, height: 15, stroke: 'var(--shine)', fill: 'none', strokeWidth: 1.5 }}>{d.icon}</svg></div><div><div className="cdt-l">{d.l}</div><div className="cdt-v">{d.v}</div></div></div>
            ))}
            <div className="socs">{['ig', 'fb', 'in', 'wa'].map(s => <a className="soc" href="#" key={s}>{s}</a>)}</div>
          </div>
          <div className="fglass rvr">
            <span className="fey">Send a Message</span>
            <label className="fl">Name</label><input className="fi" placeholder="Your full name" value={f.name} onChange={up('name')} />
            <label className="fl">Email or Phone</label><input className="fi" placeholder="How to reach you" value={f.contact} onChange={up('contact')} />
            <label className="fl">Subject</label>
            <select className="fsl" value={f.subject} onChange={up('subject')}>{['General Inquiry', 'Custom Order', 'Pricing & Bulk', 'Complaint / Feedback', 'Partnership'].map(o => <option key={o}>{o}</option>)}</select>
            <label className="fl">Message</label><textarea className="fta" style={{ minHeight: 115 }} placeholder="How can we help?" value={f.msg} onChange={up('msg')} />
            <button className="fsub" onClick={submit}><span className="fsub-t">{btn}</span></button>
            {status.msg && <div className="fstat" style={{ color: status.color }}>{status.msg}</div>}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <>
      <footer className="footer">
        <div><span className="f-logo">Zul<em>aa</em>l</span><p className="f-tagline">Pakistan's premium water brand — pure, certified, and delivered with care across the nation.</p></div>
        <div><h4>Products</h4><ul>{['250ml Personal', '1L Standard', '5L Family', '19L Dispenser', 'Custom Bottles'].map(i => <li key={i}><a href="#">{i}</a></li>)}</ul></div>
        <div><h4>Company</h4><ul>{['About Us', 'Quality', 'Coverage', 'Careers'].map(i => <li key={i}><a href="#">{i}</a></li>)}</ul></div>
        <div><h4>Support</h4><ul>{['Track Order', 'FAQs', 'Privacy Policy', 'Terms'].map(i => <li key={i}><a href="#">{i}</a></li>)}</ul></div>
      </footer>
      <div className="f-bot"><p>© 2025 Zulaal Water. All rights reserved. PSQCA Registered.</p><p>Made with care in Pakistan 🇵🇰</p></div>
    </>
  )
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function PublicSite() {
  useCursor()
  useReveal()
  useNavScroll()
  useThree()
  useCardTilt()
  useWaterFill()

  return (
    <>
      <Loader />
      <div id="c1" /><div id="c2" />
      <canvas id="cvs" />
      <Nav />
      <Hero />
      <Marquee />
      <div className="divider" />
      <About />
      <div className="divider" />
      <Products />
      <div className="divider" />
      <CustomOrder />
      <div className="divider" />
      <Testimonials />
      <div className="divider" />
      <Coverage />
      <div className="divider" />
      <Contact />
      <Footer />
    </>
  )
}
