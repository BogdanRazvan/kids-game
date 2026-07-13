import { useEffect, useRef, useState, PointerEvent as RPointerEvent } from 'react'
import { TopBar } from '../components/TopBar'
import { GameProps } from '../lib/game'
import { speak, tone } from '../lib/audio'

// Wave the magic wand: drag a finger across the night and it leaves a trail of
// twinkling shapes with soft chimes. Pick a different wand from the tray. Every-
// thing fades on its own — no mess, no fail. A pentatonic scale keeps it pretty.
const WANDS = [
  { id: 'stele', icon: '⭐', emojis: ['✨', '⭐', '🌟', '💫'] },
  { id: 'inimi', icon: '💖', emojis: ['💖', '💗', '💕', '❤️', '💓'] },
  { id: 'zăpadă', icon: '❄️', emojis: ['❄️', '🌨️', '☃️', '✨'] },
  { id: 'flori', icon: '🌸', emojis: ['🌸', '🌼', '🌺', '🌷', '💐'] },
  { id: 'curcubeu', icon: '🌈', emojis: ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣'] },
  { id: 'baloane', icon: '🫧', emojis: ['🫧', '⚪', '🔵', '🟣'] },
]
const PENTA = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66]

type Spark = { id: number; x: number; y: number; emoji: string; size: number }
type Star = { x: number; y: number; s: number; dur: number; delay: number }

export function Sparkle({ onBack }: GameProps) {
  const areaRef = useRef<HTMLDivElement>(null)
  const [sparks, setSparks] = useState<Spark[]>([])
  const [sel, setSel] = useState(0)
  const nextId = useRef(0)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const lastSound = useRef(0)
  const step = useRef(0)
  const stars = useRef<Star[]>(
    Array.from({ length: 46 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 92,
      s: 1 + Math.random() * 2.4,
      dur: 1.6 + Math.random() * 2.6,
      delay: Math.random() * 3,
    }))
  ).current

  useEffect(() => {
    speak('Baghetă magică')
  }, [])

  function emit(clientX: number, clientY: number, force = false) {
    const rect = areaRef.current!.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    // Only drop a new shape once the finger has travelled a little.
    const prev = lastPos.current
    if (!force && prev) {
      const dx = x - prev.x
      const dy = y - prev.y
      if (dx * dx + dy * dy < 18 * 18) return
    }
    lastPos.current = { x, y }
    const set = WANDS[sel].emojis
    const id = nextId.current++
    setSparks((s) => [
      ...s.slice(-60),
      { id, x, y, emoji: set[(Math.random() * set.length) | 0], size: 22 + Math.random() * 26 },
    ])
    window.setTimeout(() => setSparks((s) => s.filter((sp) => sp.id !== id)), 900)
    // Throttle chimes so a fast drag doesn't blur into noise.
    const now = performance.now()
    if (now - lastSound.current > 90) {
      lastSound.current = now
      tone(PENTA[step.current++ % PENTA.length], 0.45, 'sine', 0, 0.08)
    }
  }

  function down(e: RPointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    lastPos.current = null
    emit(e.clientX, e.clientY, true)
  }
  function move(e: RPointerEvent<HTMLDivElement>) {
    if (e.buttons === 0) return
    emit(e.clientX, e.clientY)
  }
  const stop = (e: RPointerEvent<Element>) => e.stopPropagation()

  return (
    <div className="game">
      <TopBar title="Baghetă magică" onBack={onBack} total={0} index={0} onReplay={() => speak('Baghetă magică')} hideTitle />
      <div ref={areaRef} className="sparkle-area" onPointerDown={down} onPointerMove={move}>
        {stars.map((st, i) => (
          <span
            key={i}
            className="fw-star"
            style={{
              left: `${st.x}%`,
              top: `${st.y}%`,
              width: st.s,
              height: st.s,
              ['--dur' as string]: `${st.dur}s`,
              ['--delay' as string]: `${st.delay}s`,
            } as React.CSSProperties}
          />
        ))}

        <button className="prompt fw-prompt" onPointerDown={stop} onClick={() => speak('Baghetă magică')}>
          <span className="prompt-icon" aria-hidden="true">🔊</span>
          Baghetă magică
        </button>

        {sparks.map((s) => (
          <span key={s.id} className="spark" style={{ left: s.x, top: s.y, fontSize: s.size }}>
            {s.emoji}
          </span>
        ))}

        <div className="fw-picker" onPointerDown={stop}>
          {WANDS.map((w, i) => (
            <button
              key={w.id}
              className={'fw-tab' + (i === sel ? ' sel' : '')}
              onClick={() => setSel(i)}
              aria-label={w.id}
            >
              {w.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
