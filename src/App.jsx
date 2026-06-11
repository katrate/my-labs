import { useEffect, useRef, useState, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { Button } from './components/ui/button'

const PROJ = [
  { icon: '\uD83D\uDCC2', title: 'Notie', desc: 'Fully personalised customizable notes app.', tag: 'App / Notes', href: 'https://website-gold-six-23.vercel.app/', color: '#4e65fa', cat: 0 },
  { icon: '\uD83E\uDDEE', title: 'FinTrack', desc: 'Open-source finance recording app.', tag: 'App / Finance', href: 'https://fintrack-website-virid.vercel.app/', color: '#00ff88', cat: 0 },
  { icon: '\u26A1', title: 'Katlans (.kl)', desc: 'Custom language .kl to C to binary.', tag: 'Language / Compiler', href: 'https://github.com/katrate/katlans', color: '#7c3aed', cat: 1 },
  { icon: '\u2328\uFE0F', title: 'Palimpsest', desc: 'Git-inspired snapshot browser TUI.', tag: 'CLI / Tool', href: 'https://github.com/katrate/palimpsest', color: '#c8ff00', cat: 2 },
  { icon: '\uD83D\uDCBB', title: 'ShellMax', desc: 'CLI for workspace and system info.', tag: 'CLI / Tool', href: 'https://github.com/katrate/shellmax', color: '#00ffe0', cat: 2 },
  { icon: '\uD83D\uDD12', title: 'EnvLock', desc: 'Encrypt .env files for safe Git sharing.', tag: 'CLI / Tool', href: 'https://github.com/katrate/envlock', color: '#ff8800', cat: 2 },
  { icon: '\uD83C\uDFAE', title: 'AirDraw', desc: 'Hologram mesh cube drawing.', tag: 'Web App', href: 'https://airdraw-six.vercel.app', color: '#c8ff00', cat: 3 },
  { icon: '\uD83D\uDEE0\uFE0F', title: 'Murder Mysteries', desc: 'Detective mystery solver.', tag: 'Game / Web', href: 'https://murder-mystery-virid.vercel.app', color: '#00ffe0', cat: 3 },
  { icon: '\uD83C\uDFAE', title: 'Speedy Moves', desc: 'Drag fast arcade action.', tag: 'Game / Web', href: 'https://dragclicker.vercel.app', color: '#ff3cac', cat: 3 },
  { icon: '\u2728', title: 'PokeDex', desc: 'Pokemon explorer web app.', tag: 'Web App', href: 'https://pokemon-lac-eight.vercel.app', color: '#00ff59', cat: 3 },
  { icon: '\u2728', title: 'ASCII Art', desc: 'Camera to ASCII real-time.', tag: 'Tool / Web', href: 'https://ascii-five-opal.vercel.app', color: '#ff0000', cat: 3 },
  { icon: '\uD83C\uDFAE', title: 'Snake.io', desc: 'Classic snake reimagined.', tag: 'Game / Web', href: 'https://snake-swipe.vercel.app', color: '#afb6ff', cat: 3 },
  { icon: '\uD83C\uDFAE', title: 'Wordle', desc: 'Word puzzle game clone.', tag: 'Game / Web', href: 'https://wordle-xi-flax.vercel.app', color: '#d000ff', cat: 3 },
]

const CAT_NAMES = ['App', 'Language', 'CLI', 'Website']
const CARD_W = 230; const CARD_H = 280
const LEFT_PAD = 700
const GROUP_LAYOUT = [
  { cat: 0, startX: 750 + LEFT_PAD, gap: 280, staggerY: true },
  { cat: 1, startX: 1550 + LEFT_PAD, gap: 280, staggerY: false },
  { cat: 2, startX: 1950 + LEFT_PAD, gap: 250, staggerY: true },
  { cat: 3, startX: 2900 + LEFT_PAD, gap: 230, staggerY: true },
]
const CARDS = []
PROJ.forEach((p, i) => {
  const grp = GROUP_LAYOUT[p.cat ?? 2]
  const sameCat = PROJ.filter(x => (x.cat ?? 2) === (p.cat ?? 2))
  const idx = sameCat.indexOf(p)
  const wx = grp.startX + idx * grp.gap
  const wy = grp.staggerY && idx % 2 === 1 ? 110 : 60
  CARDS.push({ ...p, i, wx, wy, rot: 0 })
})

const MENU_ITEMS = []
const uniqueCats = [...new Set(PROJ.map(p => p.cat ?? 2))].sort()
uniqueCats.forEach(cat => {
  MENU_ITEMS.push({ t: 'h', label: CAT_NAMES[cat] })
  CARDS.filter(c => c.cat === cat).forEach(p => MENU_ITEMS.push({ t: 'p', ...p }))
})

const WORLD_W = Math.max(...CARDS.map(c => c.wx)) + CARD_W + 400

// ─── BGM ───
let bgmCtx = null; let bgmGain = null; let bgmPlaying = false
const BGM_NOTES = [
  [262, 0.15], [294, 0.15], [330, 0.15], [349, 0.15],
  [392, 0.3],  [349, 0.15], [330, 0.15], [294, 0.15],
  [262, 0.3],  [0,   0.15], [262, 0.15], [294, 0.15],
  [330, 0.15], [349, 0.15], [392, 0.3],  [330, 0.15],
  [294, 0.15], [262, 0.3],  [0,   0.15], [262, 0.15],
  [330, 0.15], [392, 0.15], [523, 0.3],  [392, 0.15],
  [349, 0.15], [330, 0.15], [294, 0.3],  [262, 0.15],
  [294, 0.15], [330, 0.15], [262, 0.3],  [0,   0.15],
]

function startBGM() {
  if (bgmPlaying) return
  try {
    bgmCtx = new (window.AudioContext || window.webkitAudioContext)()
    bgmGain = bgmCtx.createGain(); bgmGain.gain.value = 0.04; bgmGain.connect(bgmCtx.destination)
    bgmPlaying = true; scheduleBGM()
  } catch (e) {}
}

function scheduleBGM() {
  if (!bgmPlaying || !bgmCtx) return
  let t = bgmCtx.currentTime + 0.05
  for (let loop = 0; loop < 3; loop++) {
    BGM_NOTES.forEach(([freq, dur]) => {
      if (freq > 0) {
        const osc = bgmCtx.createOscillator()
        osc.type = 'square'; osc.frequency.value = freq
        const g = bgmCtx.createGain(); g.gain.setValueAtTime(0.04, t)
        g.gain.exponentialRampToValueAtTime(0.001, t + dur)
        osc.connect(g); g.connect(bgmGain)
        osc.start(t); osc.stop(t + dur)
      }
      t += dur
    })
  }
  setTimeout(scheduleBGM, (t - bgmCtx.currentTime) * 1000 - 200)
}

function stopBGM() {
  bgmPlaying = false
  if (bgmCtx) { bgmCtx.close(); bgmCtx = null }
}

// ─── SFX ───
let sfxCtx = null; let sfxGain = null
function getSfx() {
  if (!sfxCtx) try {
    sfxCtx = new (window.AudioContext || window.webkitAudioContext)()
    sfxGain = sfxCtx.createGain(); sfxGain.gain.value = 0.06; sfxGain.connect(sfxCtx.destination)
  } catch (e) {}
  return sfxCtx
}
function sfx(freq, dur, type = 'square', vol = 0.06) {
  const ctx = getSfx(); if (!ctx) return
  try {
    const osc = ctx.createOscillator()
    osc.type = type; osc.frequency.setValueAtTime(freq, ctx.currentTime)
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    osc.connect(g); g.connect(sfxGain)
    osc.start(); osc.stop(ctx.currentTime + dur)
  } catch (e) {}
}
function sfxNote(freq, dur, vol) { sfx(freq, dur, 'square', vol) }
const SFX = {
  step:    () => sfxNote(80, 0.035, 0.02),
  menu:    () => sfxNote(660, 0.045, 0.035),
  select:  () => { sfxNote(523, 0.07, 0.05); setTimeout(() => sfxNote(659, 0.07, 0.05), 55); setTimeout(() => sfxNote(784, 0.1, 0.05), 110) },
  pause:   () => sfx(400, 0.15, 'sawtooth', 0.035),
  resume:  () => sfx(600, 0.15, 'sawtooth', 0.035),
  near:    () => sfxNote(1200, 0.07, 0.025),
}

function Card({ card, cam, g, w, onHover, onLeave, onOpen }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    if (ref.current) gsap.fromTo(ref.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: card.i * 0.02 })
  }, [])
  const sx = card.wx - cam
  if (sx < -CARD_W - 40 || sx > w + 40) return null
  const by = g - CARD_H - card.wy - 8
  return (
    <div
      ref={ref}
      onMouseEnter={() => onHover(card.i)}
      onMouseLeave={onLeave}
      onClick={() => onOpen(card)}
      style={{
        position: 'absolute', left: sx, top: by,
        width: CARD_W, height: CARD_H,
        borderRadius: 12,
        background: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        transform: `rotate(${card.rot}deg)`,
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        overflow: 'hidden',
        fontFamily: 'Inter, sans-serif',
      }}
      onMouseOver={e => {
        e.currentTarget.style.transform = `rotate(${card.rot}deg) translateY(-4px)`
        e.currentTarget.style.boxShadow = `0 12px 28px ${card.color}30`
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = `rotate(${card.rot}deg)`
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
      }}
    >
      <div style={{ height: 4, background: card.color }} />
      <div style={{ fontSize: 32, textAlign: 'center', paddingTop: 12 }}>{card.icon}</div>
      <div style={{ fontWeight: 600, fontSize: 13, textAlign: 'center', color: '#1a1a2e', padding: '6px 10px 0' }}>
        {card.title}
      </div>
      <div style={{ margin: '6px 20px 0', height: 1, background: 'rgba(26,26,46,0.08)' }} />
      <div style={{ fontSize: 11, color: 'rgba(26,26,46,0.55)', padding: '8px 16px 0', lineHeight: 1.4 }}>
        {card.desc}
      </div>
      <div style={{
        position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
        background: card.color + '15', borderRadius: 8,
        padding: '4px 14px', fontSize: 10, color: card.color,
      }}>
        {card.tag}
      </div>
    </div>
  )
}

export default function App() {
  const cv = useRef(null)
  const cam = useRef(0); const ch = useRef({ x: Math.floor(window.innerWidth / 2), step: 0, dir: 1 })
  const heroX = useRef(Math.floor(window.innerWidth / 2))
  const inp = useRef({ l: false, r: false }); const mp = useRef({ x: 0, y: 0 })
  const sz = useRef({ w: window.innerWidth, h: window.innerHeight })
  const hv = useRef(-1); const tn = useRef(0)
  const [tip, setTip] = useState(null); const [tp, setTp] = useState({ x: 0, y: 0 })
  const [paused, setPaused] = useState(false); const [menuI, setMenuI] = useState(0)
  const [bgmOn, setBgmOn] = useState(false); const [, forceUpdate] = useState(0)
  const pausedRef = useRef(false); const menuIRef = useRef(0); const bgmStarted = useRef(false)
  const [ready, setReady] = useState(false)
  const [showLoader, setShowLoader] = useState(true)
  const loadEl = useRef(null)
  const headAppear = useRef({})
  const loadRef = useRef(0); const stepRef = useRef(0); const prevHv = useRef(-2)

  useEffect(() => { setTimeout(() => setReady(true), 400) }, [])

  useEffect(() => {
    if (ready && loadEl.current) {
      gsap.to(loadEl.current, {
        opacity: 0, scale: 0.95, duration: 0.5, ease: 'power2.inOut',
        onComplete: () => setShowLoader(false),
      })
    }
  }, [ready])

  const gy = () => sz.current.h * 0.72
  const maxCam = () => Math.max(0, WORLD_W - sz.current.w)

  // ─── PARTICLES ───
  const particles = useRef([])
  useEffect(() => {
    const p = []
    for (let i = 0; i < 120; i++) {
      p.push({
        x: Math.random() * WORLD_W,
        y: Math.random() * sz.current.h * 0.65 + 20,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 2 + 1,
        baseX: 0,
        baseY: 0,
      })
      p[i].baseX = p[i].x
      p[i].baseY = p[i].y
    }
    particles.current = p
  }, [])

  function updateParticles(w, h) {
    const mx = mp.current.x + cam.current
    const my = mp.current.y
    for (const p of particles.current) {
      const dx = p.x - mx
      const dy = p.y - my
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 150) {
        const force = (150 - dist) / 150 * 2
        p.x += dx / dist * force
        p.y += dy / dist * force
      }
      p.x += p.vx
      p.y += p.vy
      p.x += (p.baseX - p.x) * 0.005
      p.y += (p.baseY - p.y) * 0.005
    }
  }

  function drawParticles(ctx, w, h) {
    for (const p of particles.current) {
      const sx = p.x - cam.current
      if (sx < -10 || sx > w + 10 || p.y > gy()) continue
      ctx.beginPath()
      ctx.arc(sx, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(78,101,250,0.12)'
      ctx.fill()
    }
  }

  function drawSectionHeaders(ctx, w, h, t) {
    const g = gy()
    if (!headAppear.current) headAppear.current = {}
    const headers = GROUP_LAYOUT.map(grp => ({
      x: grp.startX,
      label: CAT_NAMES[grp.cat].toUpperCase(),
      color: ['#4e65fa', '#7c3aed', '#00ffe0', '#ff3cac'][grp.cat],
    }))
    for (const hdr of headers) {
      const sx = hdr.x - cam.current
      const visible = sx > -60 && sx < w + 60
      if (!visible) continue
      if (!headAppear.current[hdr.label]) headAppear.current[hdr.label] = t
      const elapsed = t - headAppear.current[hdr.label]
      const progress = Math.min(elapsed / 1000, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      const avail = g - 80
      const size = Math.floor(avail / 8)
      const lx = sx - 60
      const textH = size * hdr.label.length * 0.6
      const halfH = textH / 2
      const topY = 40
      const botY = g - 40
      ctx.save()
      ctx.strokeStyle = hdr.color + '25'
      ctx.lineWidth = 2
      ctx.beginPath()
      const aboveTop = topY + (1 - ease) * (g / 2 - halfH - 8 - topY)
      ctx.moveTo(lx, g / 2 - halfH - 8)
      ctx.lineTo(lx, aboveTop)
      const belowBot = botY - (1 - ease) * (botY - (g / 2 + halfH + 8))
      ctx.moveTo(lx, g / 2 + halfH + 8)
      ctx.lineTo(lx, belowBot)
      ctx.stroke()
      ctx.globalAlpha = ease
      ctx.translate(lx, g / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillStyle = hdr.color + '80'
      ctx.font = `${size}px Bierika, Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(hdr.label, 0, 0)
      ctx.restore()
    }
  }

  function bgmToggle() {
    if (!bgmStarted.current) { bgmStarted.current = true; startBGM(); setBgmOn(true) }
    else if (bgmPlaying) { stopBGM(); setBgmOn(false) }
    else { startBGM(); setBgmOn(true) }
  }

  function drawSky(ctx, w, h) {
    const g = ctx.createLinearGradient(0, 0, 0, h * 0.3)
    g.addColorStop(0, '#f5f0e8'); g.addColorStop(1, '#fdfcfa')
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
  }

  function drawGround(ctx, w, h, g) {
    ctx.fillStyle = '#000'; ctx.fillRect(0, g, w, h - g)
    ctx.fillStyle = 'rgba(78,101,250,0.04)'
    ctx.fillRect(0, g, w, 1)
  }

  function drawCharacter(ctx, w, h, t) {
    const g = gy(); const sx = ch.current.x - cam.current
    if (sx < -60 || sx > w + 60) return
    const walk = ch.current.dir < 0 ? -1 : 1
    const bob = Math.sin(t * 0.008) * 2
    const cx = sx; const cy = g - 22 + bob
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.beginPath(); ctx.ellipse(cx, g + 2, 14, 4, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#1a1a2e'
    ctx.beginPath(); ctx.arc(cx, cy - 8, 12, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#f0eee8'
    ctx.beginPath(); ctx.arc(cx + walk * 3, cy - 10, 4, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#1a1a2e'
    ctx.beginPath(); ctx.arc(cx + walk * 4, cy - 10, 2, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#4e65fa'
    ctx.fillRect(cx - 8, cy + 2, 16, 14)
    ctx.fillStyle = '#f0eee8'
    ctx.fillRect(cx - 2, cy + 6, 4, 6)
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(cx - 8, cy + 16, 6, 8)
    ctx.fillRect(cx + 2, cy + 16, 6, 8)
  }

  function drawHeroSign(ctx, w, h, t) {
    const g = gy(); const bx = heroX.current - cam.current
    if (bx < -500 || bx > w + 100) return
    const pulse = 0.5 + 0.5 * Math.sin(t * 0.002)
    const by = g - 200
    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(78,101,250,0.12)'; ctx.shadowBlur = 40
    ctx.font = 'bold 56px Nexokora Techno, Inter, sans-serif'; ctx.fillStyle = '#1a1a2e'
    ctx.fillText('KATRATE', bx, by)
    ctx.shadowBlur = 0
    ctx.font = 'bold 15px Inter, sans-serif'; ctx.fillStyle = '#4e65fa'
    ctx.fillText('BUILDER & LANGUAGE CREATOR', bx, by + 36)
    ctx.fillStyle = 'rgba(26,26,46,0.4)'
    ctx.font = '13px Inter, sans-serif'
    ctx.fillText('CRAFTING LANGUAGES TOOLS & WEB', bx, by + 58)
    if (Math.sin(t * 0.005) > 0.1) {
      ctx.fillStyle = 'rgba(26,26,46,0.2)'
      ctx.font = '12px Inter, sans-serif'
      ctx.fillText('PRESS ARROW TO EXPLORE', bx, by + 90)
    }
  }

  function drawFooter(ctx, w, h) {
    const lastX = Math.max(...CARDS.map(c => c.wx)) + CARD_W + 300
    const sx = lastX - cam.current
    if (sx < -200 || sx > w + 200) return
    ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(26,26,46,0.2)'
    ctx.fillText('BUILT WITH LOVE — KATRATE', sx, g * 0.5)
    ctx.fillStyle = 'rgba(78,101,250,0.3)'
    ctx.fillRect(sx - 100, g * 0.5 + 12, 200, 1)
  }

  function drawControls(ctx, w, h) {
    if (cam.current < maxCam() - 30) {
      ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'center'
      ctx.fillStyle = 'rgba(26,26,46,0.15)'
      ctx.fillText('ARROW KEYS / A,D TO WALK', w / 2, h - 16)
    }
  }

  function drawPauseMenu(ctx, w, h) {
    ctx.fillStyle = 'rgba(240,238,232,0.85)'; ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(78,101,250,0.04)'; ctx.fillRect(0, 0, w, h)
    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(78,101,250,0.08)'; ctx.shadowBlur = 20
    ctx.font = 'bold 26px Inter, sans-serif'; ctx.fillStyle = '#1a1a2e'
    ctx.fillText('Projects', w / 2, 44)
    ctx.shadowBlur = 0
    ctx.fillStyle = '#4e65fa'; ctx.fillRect(w / 2 - 70, 54, 140, 3)
    const totalH = MENU_ITEMS.length * 28
    const startY = Math.max(70, (h - totalH) / 2)
    MENU_ITEMS.forEach((item, i) => {
      const y = startY + i * 28; const isSel = i === menuIRef.current
      if (item.t === 'h') {
        ctx.font = 'bold 11px Inter, sans-serif'; ctx.fillStyle = 'rgba(78,101,250,0.55)'
        ctx.fillText(item.label, w / 2, y)
      } else {
        const iy = y - 8
        ctx.strokeStyle = isSel ? item.color + '40' : 'rgba(26,26,46,0.06)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(w / 2 - 170, iy); ctx.lineTo(w / 2 + 170, iy)
        ctx.lineTo(w / 2 + 170, iy + 24); ctx.lineTo(w / 2 - 170, iy + 24)
        ctx.closePath(); ctx.stroke()
        if (isSel) {
          ctx.shadowColor = 'rgba(78,101,250,0.15)'; ctx.shadowBlur = 12
          ctx.fillStyle = 'rgba(78,101,250,0.08)'
          ctx.beginPath()
          ctx.moveTo(w / 2 - 170, iy); ctx.lineTo(w / 2 + 170, iy)
          ctx.lineTo(w / 2 + 170, iy + 24); ctx.lineTo(w / 2 - 170, iy + 24)
          ctx.closePath(); ctx.fill()
          ctx.shadowBlur = 0
        }
        ctx.font = '13px sans-serif'; ctx.textAlign = 'left'
        ctx.fillText(item.icon, w / 2 - 158, y + 2)
        ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'left'
        ctx.fillStyle = isSel ? '#1a1a2e' : 'rgba(26,26,46,0.5)'
        ctx.fillText(item.title, w / 2 - 132, y + 3)
        ctx.font = '9px Inter, sans-serif'; ctx.textAlign = 'right'
        ctx.fillStyle = item.color
        ctx.fillText(item.tag, w / 2 + 168, y + 3)
      }
    })
    ctx.textAlign = 'center'; ctx.font = '10px Inter, sans-serif'
    ctx.fillStyle = 'rgba(26,26,46,0.2)'
    ctx.fillText('UP/DOWN: NAVIGATE  |  ENTER: OPEN  |  ESC: CLOSE', w / 2, h - 20)
  }

  // ─── GAME LOOP ───
  useEffect(() => {
    if (!ready) return
    const canvas = cv.current; const ctx = canvas.getContext('2d'); let id
    function resize() {
      const dpr = window.devicePixelRatio || 1
      const w = window.innerWidth; const h = window.innerHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      sz.current.w = w; sz.current.h = h
    }
    resize(); window.addEventListener('resize', resize)
    function tick(t) {
      tn.current = t; const { w, h } = sz.current; const g = gy(); const chr = ch.current
      ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0)
      if (!pausedRef.current) {
        const speed = 3.8
        if (inp.current.l) { chr.x -= speed; chr.dir = -1 }
        if (inp.current.r) { chr.x += speed; chr.dir = 1 }
        chr.x = Math.max(40, Math.min(WORLD_W - 40, chr.x))
        const moving = inp.current.l || inp.current.r
        if (moving) { chr.step += 0.06; stepRef.current += chr.step * 2; if (stepRef.current > 12) { stepRef.current = 0; SFX.step() } }
        else if (Math.abs(chr.step) > 0.01) chr.step *= 0.8
        else chr.step = 0
        const mc2 = maxCam(); const ct = Math.max(0, Math.min(mc2, chr.x - w * 0.3))
        cam.current += (ct - cam.current) * 0.05
        let ni = -1
        for (const card of CARDS) { if (Math.abs(chr.x - card.wx) < CARD_W + 50) { ni = card.i; break } }
        hv.current = ni
        if (ni >= 0 && ni !== prevHv.current) SFX.near()
        prevHv.current = ni
      }
      ctx.clearRect(0, 0, w, h)
      updateParticles(w, h)
      drawSky(ctx, w, h, t); drawParticles(ctx, w, h); drawSectionHeaders(ctx, w, h, t); drawGround(ctx, w, h, g)
      drawHeroSign(ctx, w, h, t)
      drawCharacter(ctx, w, h, t); drawFooter(ctx, w, h)
      if (!pausedRef.current) drawControls(ctx, w, h)
      if (pausedRef.current) drawPauseMenu(ctx, w, h)
      forceUpdate(n => n + 1)
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize) }
  }, [ready])

  // ─── INPUT ───
  useEffect(() => {
    const kd = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') inp.current.l = true
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') inp.current.r = true
      if (e.key === 'Enter') {
        if (pausedRef.current) { const item = MENU_ITEMS[menuIRef.current]; if (item && item.t === 'p') { SFX.select(); window.open(item.href, '_blank', 'noopener') } }
        else { const found = CARDS.find(c => c.i === hv.current); if (found) { SFX.select(); window.open(found.href, '_blank', 'noopener') } }
      }
      if (e.key === 'Escape') {
        const was = pausedRef.current
        pausedRef.current = !was; setPaused(pausedRef.current)
        if (was) SFX.resume(); else SFX.pause()
        if (!pausedRef.current) document.body.style.cursor = 'default'
      }
      if (pausedRef.current) {
        if (e.key === 'ArrowUp') {
          let ni = menuIRef.current
          do { ni = (ni - 1 + MENU_ITEMS.length) % MENU_ITEMS.length } while (MENU_ITEMS[ni].t !== 'p' && ni !== menuIRef.current)
          if (MENU_ITEMS[ni].t === 'p') { menuIRef.current = ni; setMenuI(ni); SFX.menu() }
        }
        if (e.key === 'ArrowDown') {
          let ni = menuIRef.current
          do { ni = (ni + 1) % MENU_ITEMS.length } while (MENU_ITEMS[ni].t !== 'p' && ni !== menuIRef.current)
          if (MENU_ITEMS[ni].t === 'p') { menuIRef.current = ni; setMenuI(ni); SFX.menu() }
        }
      }
    }
    const ku = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') inp.current.l = false
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') inp.current.r = false
    }
    const mm = (e) => {
      mp.current.x = e.clientX; mp.current.y = e.clientY
    }
    const mc = (e) => {
      if (!pausedRef.current) return
      const w = sz.current.w; const h = sz.current.h
      const totalH = MENU_ITEMS.length * 28
      const startY = Math.max(70, (h - totalH) / 2)
      MENU_ITEMS.forEach((item, i) => {
        if (item.t !== 'p') return
        const y = startY + i * 28
        if (e.clientX >= w/2-170 && e.clientX <= w/2+170 && e.clientY >= y-8 && e.clientY <= y+16) { SFX.select(); window.open(item.href, '_blank', 'noopener') }
      })
    }
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku)
    window.addEventListener('mousemove', mm); window.addEventListener('click', mc)
    return () => {
      window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku)
      window.removeEventListener('mousemove', mm)
    }
  }, [])

  const g = gy()
  // top bar stagger
  const topBarRef = useRef(null)
  useEffect(() => {
    if (topBarRef.current) {
      const btns = topBarRef.current.querySelectorAll('button, a')
      gsap.fromTo(btns, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.5 })
    }
  }, [ready])

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#f0eee8' }}>
      <canvas ref={cv} style={{ display: 'block', width: '100%', height: '100%', position: 'absolute' }} />
      <div style={{ position: 'absolute', inset: 0 }}>
        {!paused && CARDS.map(card => (
          <Card
            key={card.i}
            card={card}
            cam={cam.current}
            g={g}
            w={sz.current.w}
            onHover={(id) => { hv.current = id; setTip(card); setTp({ x: mp.current.x + 12, y: mp.current.y - 10 }); document.body.style.cursor = 'pointer' }}
            onLeave={() => { hv.current = -1; setTip(null); document.body.style.cursor = 'default' }}
            onOpen={(c) => { SFX.select(); window.open(c.href, '_blank', 'noopener') }}
          />
        ))}
      </div>

      {/* top bar — GitHub only */}
      <div ref={topBarRef} className="topBar" style={{
        position: 'fixed', top: 12, width: '100%', zIndex: 200,
        display: 'flex', justifyContent: 'center', gap: 10,
        pointerEvents: 'none',
        opacity: paused ? 0 : 1,
        transition: 'opacity 0.15s',
      }}>
        <a href="https://github.com/katrate" target="_blank" rel="noopener"
          style={{ pointerEvents: 'auto', textDecoration: 'none' }}>
          <Button variant="default"
            className="rounded-full py-0 ps-0 pe-5 h-9 gap-0 text-white text-sm font-medium shadow-none"
            style={{ background: '#1a1a2e', minWidth: 120 }}
            onClick={(e) => { e.preventDefault(); window.open('https://github.com/katrate', '_blank', 'noopener') }}>
            <div className="me-1.5 flex aspect-square h-full items-center justify-center p-0.5">
              <img className="h-7 w-7 rounded-full object-cover"
                src="https://github.com/katrate.png"
                alt="katrate" width={28} height={28} aria-hidden="true" />
            </div>
            katrate
          </Button>
        </a>
      </div>

      {/* bottom-left controls — black area */}
      <div style={{
        position: 'fixed', left: 16, bottom: 16, zIndex: 200,
        display: 'flex', gap: 8,
        pointerEvents: 'none',
        opacity: paused ? 0 : 1,
        transition: 'opacity 0.15s',
      }}>
        <button onClick={() => { bgmToggle(); if (!bgmStarted.current) bgmToggle() }}
          style={{
            pointerEvents: 'auto',
            fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 500,
            background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 6,
            color: 'rgba(255,255,255,0.5)', padding: '6px 12px', cursor: 'pointer',
            backdropFilter: 'blur(4px)',
          }}
        >
          ♫ {bgmOn ? 'ON' : 'OFF'}
        </button>
        <button onClick={() => { ch.current.x = Math.floor(sz.current.w / 2) }}
          style={{
            pointerEvents: 'auto',
            fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 500,
            background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 6,
            color: 'rgba(255,255,255,0.5)', padding: '6px 12px', cursor: 'pointer',
            backdropFilter: 'blur(4px)',
          }}
        >
          &#9664; Start
        </button>
        <button onClick={() => { ch.current.x = WORLD_W - 40 }}
          style={{
            pointerEvents: 'auto',
            fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 500,
            background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 6,
            color: 'rgba(255,255,255,0.5)', padding: '6px 12px', cursor: 'pointer',
            backdropFilter: 'blur(4px)',
          }}
        >
          End &#9654;
        </button>
        <button onClick={() => {
          const cx = ch.current.x
          let nearest = 0
          for (let i = 0; i < CARDS.length; i++) {
            if (Math.abs(CARDS[i].wx - cx) < Math.abs(CARDS[nearest].wx - cx)) nearest = i
          }
          const card = CARDS[nearest > 0 ? nearest - 1 : CARDS.length - 1]
          ch.current.x = card.wx
          cam.current = card.wx - sz.current.w * 0.3
        }}
          style={{
            pointerEvents: 'auto',
            fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 500,
            background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 6,
            color: 'rgba(255,255,255,0.5)', padding: '6px 12px', cursor: 'pointer',
            backdropFilter: 'blur(4px)',
          }}
        >
          &#9664; Prev
        </button>
        <button onClick={() => {
          const cx = ch.current.x
          let nearest = 0
          for (let i = 0; i < CARDS.length; i++) {
            if (Math.abs(CARDS[i].wx - cx) < Math.abs(CARDS[nearest].wx - cx)) nearest = i
          }
          const card = CARDS[nearest < CARDS.length - 1 ? nearest + 1 : 0]
          ch.current.x = card.wx
          cam.current = card.wx - sz.current.w * 0.3
        }}
          style={{
            pointerEvents: 'auto',
            fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 500,
            background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 6,
            color: 'rgba(255,255,255,0.5)', padding: '6px 12px', cursor: 'pointer',
            backdropFilter: 'blur(4px)',
          }}
        >
          Next &#9654;
        </button>
      </div>

      {tip && !paused && (
        <div style={{
          position: 'fixed', left: tp.x, top: tp.y, zIndex: 100,
          pointerEvents: 'none', background: '#1a1a2e', borderRadius: 8,
          padding: '10px 14px', fontFamily: 'Inter, sans-serif',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#f0eee8', marginBottom: 4 }}>{tip.icon} {tip.title}</div>
          <div style={{ fontSize: '10px', color: tip.color }}>{CAT_NAMES[tip.cat ?? 2]} — Click to open</div>
        </div>
      )}
      {paused && (
        <div style={{
          position: 'fixed', bottom: 44, left: '50%', transform: 'translateX(-50%)',
          zIndex: 100, fontFamily: 'Inter, sans-serif', fontSize: '11px',
          color: 'rgba(26,26,46,0.25)', textAlign: 'center', pointerEvents: 'none',
        }}>
          ESC to close
        </div>
      )}

      {showLoader && <div ref={loadEl} style={{
        position: 'fixed', inset: 0, background: '#f0eee8', zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
      }}>
        <div style={{
          fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600,
          color: '#1a1a2e', letterSpacing: '0.05em',
        }}>
          Loading
        </div>
        <div style={{
          width: 160, height: 3, background: 'rgba(26,26,46,0.08)',
          borderRadius: 2, overflow: 'hidden',
        }}>
          <div style={{
            width: '40%', height: '100%',
            background: '#4e65fa', borderRadius: 2,
            animation: 'loadSlide 1s ease-in-out infinite',
          }} />
        </div>
        <style>{`
          @keyframes loadSlide {
            0% { transform: translateX(-100%); margin-left: 0; }
            100% { transform: translateX(0); margin-left: 250%; }
          }
        `}</style>
      </div>}

    </div>
  )
}
