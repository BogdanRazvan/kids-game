import { useEffect, useRef, useState, PointerEvent as RPointerEvent } from 'react'
import { TopBar } from '../components/TopBar'
import { GameProps } from '../lib/game'
import { speak, tone } from '../lib/audio'

// Pick a sea creature, then tap the water to add it. Each one swims the way it
// would in real life — fish waggle their tails, a dolphin arcs up and down, a
// crab scuttles sideways — and turns around when it reaches an edge. Ambient
// bubbles drift up from the sand and sometimes pop. Tap a creature and it darts
// with a watery bloop and a puff of bubbles. No score, no fail.
type FishType = {
  id: string
  emoji: string
  size: number
  speed: [number, number] // px/s range
  bob: number // vertical sway amplitude (px)
  freq: number // vertical sway speed
  anim: string // CSS body-animation class ('' = none)
  flip: boolean // face the direction of travel? (crabs move sideways)
}
const FISH_TYPES: FishType[] = [
  { id: 'tropical', emoji: '🐠', size: 38, speed: [34, 60], bob: 6, freq: 3.2, anim: 'wiggle', flip: true },
  { id: 'pește', emoji: '🐟', size: 38, speed: [38, 64], bob: 6, freq: 3.4, anim: 'wiggle', flip: true },
  { id: 'balon', emoji: '🐡', size: 40, speed: [16, 26], bob: 5, freq: 1.6, anim: 'puff', flip: true },
  { id: 'caracatiță', emoji: '🐙', size: 42, speed: [14, 24], bob: 11, freq: 1.8, anim: 'squish', flip: true },
  { id: 'calmar', emoji: '🦑', size: 42, speed: [30, 52], bob: 8, freq: 2.6, anim: 'jet', flip: true },
  { id: 'țestoasă', emoji: '🐢', size: 42, speed: [12, 20], bob: 4, freq: 1.2, anim: 'paddle', flip: true },
  { id: 'crevetă', emoji: '🦐', size: 32, speed: [40, 70], bob: 5, freq: 5, anim: 'twitch', flip: true },
  { id: 'crab', emoji: '🦀', size: 34, speed: [26, 46], bob: 4, freq: 6, anim: 'scuttle', flip: false },
  { id: 'delfin', emoji: '🐬', size: 48, speed: [46, 74], bob: 26, freq: 1.9, anim: '', flip: true },
  { id: 'rechin', emoji: '🦈', size: 50, speed: [40, 64], bob: 6, freq: 1.4, anim: 'sway', flip: true },
]

type Fish = { id: number; emoji: string; size: number; y: number; anim: string; delay: number }
type Bub = { id: number; x: number; y: number; size: number }
type Amb = { id: number; x: number; size: number }
// Live motion state, mutated by the animation loop (kept out of React state so
// each frame doesn't re-render).
type Motion = { x: number; dir: number; speed: number; w: number; boostUntil: number; bob: number; freq: number; phase: number; flip: boolean }
type AmbMotion = { y: number; speed: number; phase: number; popAt: number; popped: boolean; size: number }
// The emoji's ink/shadow extends a couple px past its box; a small inset hides it.
const EDGE_PAD = 4

const rand = (a: number, b: number) => a + Math.random() * (b - a)

export function Aquarium({ onBack }: GameProps) {
  const tankRef = useRef<HTMLDivElement>(null)
  const tankW = useRef(0)
  const tankH = useRef(0)
  const [fish, setFish] = useState<Fish[]>([])
  const [bubbles, setBubbles] = useState<Bub[]>([])
  const [amb, setAmb] = useState<Amb[]>([])
  const [sel, setSel] = useState(0)
  const nextId = useRef(0)
  const nodes = useRef(new Map<number, HTMLButtonElement>())
  const motion = useRef(new Map<number, Motion>())
  const ambNodes = useRef(new Map<number, HTMLSpanElement>())
  const ambMotion = useRef(new Map<number, AmbMotion>())

  useEffect(() => {
    speak('Acvariu')
  }, [])

  // Measure the tank so fish know where the edges are.
  useEffect(() => {
    const measure = () => {
      tankW.current = tankRef.current?.clientWidth ?? 0
      tankH.current = tankRef.current?.clientHeight ?? 0
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // One animation loop drives every fish and every bubble.
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const dropAmb = (id: number) => {
      ambMotion.current.delete(id)
      ambNodes.current.delete(id)
      setAmb((l) => l.filter((a) => a.id !== id))
    }
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const tsec = now / 1000
      // Fish: advance, sway the way that species moves, turn around at edges.
      motion.current.forEach((m, id) => {
        const boosting = now < m.boostUntil
        m.x += m.dir * m.speed * (boosting ? 3 : 1) * dt
        const maxX = Math.max(EDGE_PAD, tankW.current - m.w - EDGE_PAD)
        if (m.x <= EDGE_PAD) {
          m.x = EDGE_PAD
          m.dir = 1
        } else if (m.x >= maxX) {
          m.x = maxX
          m.dir = -1
        }
        const node = nodes.current.get(id)
        if (node) {
          const bobY = Math.sin(tsec * m.freq + m.phase) * m.bob
          node.style.transform = `translateX(${m.x}px) translateY(${bobY}px)`
          const inner = node.firstElementChild as HTMLElement | null
          // 🐠 faces left by default → flip it when swimming right.
          const face = m.flip ? (m.dir > 0 ? -1 : 1) : 1
          if (inner) inner.style.transform = `scaleX(${face}) scale(${boosting ? 1.25 : 1})`
        }
      })
      // Ambient bubbles: rise, wobble, and pop partway up (or fade at the top).
      ambMotion.current.forEach((m, id) => {
        if (m.popped) return
        m.y += m.speed * dt
        const node = ambNodes.current.get(id)
        if (node) node.style.transform = `translate(${Math.sin(tsec * 2 + m.phase) * 5}px, ${-m.y}px)`
        if (m.y >= m.popAt) {
          m.popped = true
          const dot = node?.firstElementChild as HTMLElement | null
          if (dot) dot.classList.add('pop')
          tone(620 + Math.random() * 520, 0.05, 'sine', 0, 0.04)
          window.setTimeout(() => dropAmb(id), 220)
        } else if (m.y >= tankH.current + m.size + 20) {
          dropAmb(id)
        }
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Slowly release ambient bubbles from the sand.
  useEffect(() => {
    const spawn = () => {
      const h = tankH.current || 400
      const id = nextId.current++
      const size = 6 + Math.random() * 14
      const willPop = Math.random() < 0.5
      ambMotion.current.set(id, {
        y: 0,
        speed: 20 + Math.random() * 36,
        phase: Math.random() * Math.PI * 2,
        popAt: willPop ? h * (0.35 + Math.random() * 0.5) : Infinity,
        popped: false,
        size,
      })
      setAmb((list) => (list.length > 16 ? list : [...list, { id, x: 5 + Math.random() * 90, size }]))
    }
    spawn()
    const iv = window.setInterval(spawn, 820)
    return () => clearInterval(iv)
  }, [])

  function addFish(e: RPointerEvent<HTMLDivElement>) {
    const rect = tankRef.current!.getBoundingClientRect()
    const t = FISH_TYPES[sel]
    const y = Math.min(82, Math.max(6, ((e.clientY - rect.top) / rect.height) * 100))
    const id = nextId.current++
    const w = t.size * 1.1 // an emoji's advance is a bit wider than its font size
    const maxX = Math.max(EDGE_PAD, rect.width - w - EDGE_PAD)
    const x = Math.min(maxX, Math.max(EDGE_PAD, e.clientX - rect.left - w / 2))
    motion.current.set(id, {
      x,
      dir: Math.random() < 0.5 ? 1 : -1,
      speed: rand(t.speed[0], t.speed[1]),
      w,
      boostUntil: 0,
      bob: t.bob,
      freq: t.freq,
      phase: Math.random() * Math.PI * 2,
      flip: t.flip,
    })
    setFish((f) => {
      const entry = { id, emoji: t.emoji, size: t.size, y, anim: t.anim, delay: rand(0, 2) }
      // Cap the tank; drop the oldest fish (and its motion/node) if too crowded.
      if (f.length >= 24) {
        const gone = f[0]
        motion.current.delete(gone.id)
        nodes.current.delete(gone.id)
        return [...f.slice(1), entry]
      }
      return [...f, entry]
    })
    tone(440 + Math.random() * 120, 0.12, 'sine', 0, 0.08)
  }

  function pokeFish(e: RPointerEvent<HTMLButtonElement>, id: number) {
    e.stopPropagation()
    const rect = tankRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    tone(720, 0.14, 'sine', 0, 0.12)
    tone(420, 0.16, 'sine', 0.05, 0.1)
    const puff: Bub[] = Array.from({ length: 4 }, (_, i) => ({
      id: nextId.current++,
      x: x - 8 + Math.random() * 16,
      y: y - 6 + Math.random() * 12,
      size: 6 + Math.random() * 8,
    }))
    setBubbles((b) => [...b.slice(-20), ...puff])
    puff.forEach((p) => window.setTimeout(() => setBubbles((b) => b.filter((x) => x.id !== p.id)), 900))
    const m = motion.current.get(id)
    if (m) m.boostUntil = performance.now() + 650
  }

  function clear() {
    motion.current.clear()
    nodes.current.clear()
    setFish([])
  }

  return (
    <div className="game">
      <TopBar title="Acvariu" onBack={onBack} total={0} index={0} hideTitle />
      <div className="game-body">
        <button className="prompt" onClick={() => speak('Acvariu')}>
          <span className="prompt-icon" aria-hidden="true">🔊</span>
          Acvariu
        </button>
        <div ref={tankRef} className="aqua-tank" onPointerDown={addFish}>
          {amb.map((a) => (
            <span
              key={a.id}
              ref={(el) => {
                if (el) ambNodes.current.set(a.id, el)
                else ambNodes.current.delete(a.id)
              }}
              className="aqua-amb"
              style={{ left: `${a.x}%` }}
            >
              <span className="aqua-amb-dot" style={{ width: a.size, height: a.size }} />
            </span>
          ))}
          {fish.map((f) => (
            <button
              key={f.id}
              ref={(el) => {
                if (el) {
                  nodes.current.set(f.id, el)
                  // Use the true rendered width so fish reach both edges evenly.
                  const m = motion.current.get(f.id)
                  if (m) m.w = el.offsetWidth
                } else nodes.current.delete(f.id)
              }}
              className="aqua-fish"
              style={{ top: `${f.y}%`, fontSize: f.size }}
              onPointerDown={(e) => pokeFish(e, f.id)}
              aria-label="pește"
            >
              <span className="aqua-fish-inner">
                <span className={'aqua-body' + (f.anim ? ' ' + f.anim : '')} style={{ animationDelay: `-${f.delay}s` }}>
                  {f.emoji}
                </span>
              </span>
            </button>
          ))}
          {bubbles.map((b) => (
            <span
              key={b.id}
              className="aqua-bubble"
              style={{ left: b.x, top: b.y, width: b.size, height: b.size }}
            />
          ))}
          <div className="aqua-floor" />
        </div>
        <div className="paint-palette">
          {FISH_TYPES.map((t, i) => (
            <button
              key={t.id}
              className={'stamp-pick' + (i === sel ? ' sel' : '')}
              onClick={() => setSel(i)}
              aria-label={t.id}
            >
              {t.emoji}
            </button>
          ))}
        </div>
        <div className="tool-row">
          <button className="tool-btn" onClick={clear}>
            🧽 Golește
          </button>
        </div>
      </div>
    </div>
  )
}
