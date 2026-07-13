import { useEffect, useRef, useState, PointerEvent as RPointerEvent } from 'react'
import { TopBar } from '../components/TopBar'
import { GameProps } from '../lib/game'
import { boom, noiseBurst, speak, tone } from '../lib/audio'

// Tap the night sky: a rocket streaks up to your finger and bursts into a real
// firework — a flash of light, then sparks that fly out and drift down and fade.
// Pick a firework style from the tray. Pure cause-and-effect, nothing to get wrong.
const PALETTES = [
  ['#ff5252', '#ffca28', '#fff176'],
  ['#40c4ff', '#18ffff', '#b388ff'],
  ['#69f0ae', '#b2ff59', '#ffff8d'],
  ['#ff80ab', '#ea80fc', '#8c9eff'],
  ['#ffd54f', '#ff8a65', '#ff5252'],
  ['#e0f7fa', '#80d8ff', '#ffffff'],
]
const GOLD = ['#ffd54f', '#ffe082', '#fff176', '#ffca28']
const EMBER = ['#fff', '#ffe082', '#fff176', '#ffd54f']
const RAINBOW = ['#ff5252', '#ff9800', '#ffeb3b', '#4caf50', '#40c4ff', '#7c4dff', '#e040fb']

const pick = <T,>(a: T[]): T => a[(Math.random() * a.length) | 0]

// Each firework style: how many sparks, how far, how much they droop (fall) and
// how long they linger. `ring` lays them in a flat circle; otherwise it's a
// filled sphere. `colors` null = a random coherent palette per shot.
type Style = {
  id: string
  icon: string
  n: number
  rMin: number
  rMax: number
  fall: number
  dur: number
  colors: string[] | null
  ring?: boolean
}
const STYLES: Style[] = [
  { id: 'bujor', icon: '🔴', n: 34, rMin: 95, rMax: 175, fall: 80, dur: 2.5, colors: null },
  { id: 'salcie', icon: '🟡', n: 30, rMin: 110, rMax: 165, fall: 175, dur: 3.6, colors: GOLD },
  { id: 'crizantemă', icon: '🟣', n: 46, rMin: 85, rMax: 190, fall: 110, dur: 3.0, colors: null },
  { id: 'pocnitoare', icon: '✨', n: 44, rMin: 60, rMax: 128, fall: 55, dur: 1.9, colors: EMBER },
  { id: 'inel', icon: '⭕', n: 34, rMin: 135, rMax: 143, fall: 70, dur: 2.7, colors: RAINBOW, ring: true },
  { id: 'curcubeu', icon: '🌈', n: 34, rMin: 95, rMax: 178, fall: 90, dur: 2.8, colors: RAINBOW },
]

type Spark = { dx: number; dy: number; color: string }
type Burst = { id: number; x: number; y: number; dur: number; fall: number; flash: string; sparks: Spark[] }
type Rocket = { id: number; x: number; y: number; from: number; color: string }
type Star = { x: number; y: number; s: number; dur: number; delay: number }

function makeBurst(s: Style): Omit<Burst, 'id' | 'x' | 'y'> {
  const colors = s.colors ?? pick(PALETTES)
  const ringColor = pick(colors)
  const sparks: Spark[] = Array.from({ length: s.n }, (_, i) => {
    const a = (i / s.n) * Math.PI * 2 + (s.ring ? 0 : Math.random() * 0.25)
    const r = s.rMin + Math.random() * (s.rMax - s.rMin)
    return { dx: Math.cos(a) * r, dy: Math.sin(a) * r, color: s.ring ? ringColor : pick(colors) }
  })
  return { dur: s.dur, fall: s.fall, flash: colors[0], sparks }
}

export function Fireworks({ onBack }: GameProps) {
  const areaRef = useRef<HTMLDivElement>(null)
  const [rockets, setRockets] = useState<Rocket[]>([])
  const [bursts, setBursts] = useState<Burst[]>([])
  const [sel, setSel] = useState(0)
  const nextId = useRef(0)
  // A fixed field of twinkling background stars, generated once.
  const stars = useRef<Star[]>(
    Array.from({ length: 46 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 88,
      s: 1 + Math.random() * 2.4,
      dur: 1.6 + Math.random() * 2.6,
      delay: Math.random() * 3,
    }))
  ).current

  useEffect(() => {
    speak('Artificii')
  }, [])

  function explode(x: number, y: number) {
    const b = makeBurst(STYLES[sel])
    const id = nextId.current++
    setBursts((bs) => [...bs.slice(-6), { id, x, y, ...b }])
    boom(130, 46, 0.28, 0.2)
    noiseBurst(0.32, { gain: 0.11, hp: 1400 })
    ;[0, 1, 2].forEach((i) => tone(880 + i * 220, 0.18, 'triangle', i * 0.04, 0.06))
    window.setTimeout(() => setBursts((bs) => bs.filter((x) => x.id !== id)), (b.dur + 0.1) * 1000)
  }

  function launch(e: RPointerEvent<HTMLDivElement>) {
    const rect = areaRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = nextId.current++
    setRockets((rs) => [...rs, { id, x, y, from: rect.height - y, color: pick(pick(PALETTES)) }])
    noiseBurst(0.24, { gain: 0.04, hp: 900, lp: 3500 })
    window.setTimeout(() => {
      setRockets((rs) => rs.filter((r) => r.id !== id))
      explode(x, y)
    }, 470)
  }

  const stop = (e: RPointerEvent<Element>) => e.stopPropagation()

  return (
    <div className="game">
      <TopBar title="Artificii" onBack={onBack} total={0} index={0} onReplay={() => speak('Artificii')} hideTitle />
      <div ref={areaRef} className="fw-area" onPointerDown={launch}>
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

        <button className="prompt fw-prompt" onPointerDown={stop} onClick={() => speak('Artificii')}>
          <span className="prompt-icon" aria-hidden="true">🔊</span>
          Artificii
        </button>

        {rockets.map((r) => (
          <span
            key={r.id}
            className="fw-rocket"
            style={{ left: r.x, top: r.y, color: r.color, ['--from' as string]: `${r.from}px` } as React.CSSProperties}
          />
        ))}
        {bursts.map((b) => (
          <span key={b.id} className="fw-burst" style={{ left: b.x, top: b.y }}>
            <span className="fw-flash" style={{ color: b.flash, ['--dur' as string]: `${b.dur}s` } as React.CSSProperties} />
            {b.sparks.map((s, i) => (
              <span
                key={i}
                className="fw-spark"
                style={{
                  color: s.color,
                  ['--dx' as string]: `${s.dx.toFixed(1)}px`,
                  ['--dy' as string]: `${s.dy.toFixed(1)}px`,
                  ['--fall' as string]: `${b.fall}px`,
                  ['--dur' as string]: `${b.dur}s`,
                } as React.CSSProperties}
              />
            ))}
          </span>
        ))}

        <div className="fw-picker" onPointerDown={stop}>
          {STYLES.map((t, i) => (
            <button
              key={t.id}
              className={'fw-tab' + (i === sel ? ' sel' : '')}
              onClick={() => setSel(i)}
              aria-label={t.id}
            >
              {t.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
