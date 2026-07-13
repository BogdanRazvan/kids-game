import { useEffect, useRef } from 'react'
import { TopBar } from '../components/TopBar'
import { GameProps } from '../lib/game'
import { speak, tone } from '../lib/audio'

// A pinwheel you flick to spin: each tap gives it a push and a rising whirr, then
// it coasts down on its own. Cause-and-effect motion — no score, no fail.
const BLADES = ['#e6394b', '#f3722c', '#f9c80e', '#43aa8b', '#1d7bd6', '#7048e8']

export function Spinner({ onBack }: GameProps) {
  const wheelRef = useRef<SVGSVGElement>(null)
  const angle = useRef(0)
  const vel = useRef(0) // degrees per frame
  const raf = useRef(0)

  useEffect(() => {
    speak('Morișcă')
    return () => cancelAnimationFrame(raf.current)
  }, [])

  function frame() {
    angle.current += vel.current
    vel.current *= 0.985 // friction
    if (wheelRef.current) wheelRef.current.style.transform = `rotate(${angle.current}deg)`
    if (Math.abs(vel.current) < 0.06) {
      vel.current = 0
      raf.current = 0
      return
    }
    raf.current = requestAnimationFrame(frame)
  }

  function push() {
    vel.current = Math.min(vel.current + 9, 46)
    // Whirr rises with how fast it's already going.
    tone(150 + vel.current * 9, 0.13, 'triangle', 0, 0.06)
    if (!raf.current) raf.current = requestAnimationFrame(frame)
  }

  return (
    <div className="game">
      <TopBar title="Morișcă" onBack={onBack} total={0} index={0} hideTitle />
      <div className="game-body">
        <button className="prompt" onClick={() => speak('Morișcă')}>
          <span className="prompt-icon" aria-hidden="true">🔊</span>
          Morișcă
        </button>
        <div className="spin-stage" onPointerDown={push}>
          <svg ref={wheelRef} className="spin-wheel" viewBox="0 0 100 100" aria-label="morișcă">
            {BLADES.map((c, i) => (
              <path
                key={i}
                d="M50 50 L50 9 Q70 16 63 42 Z"
                fill={c}
                transform={`rotate(${i * 60} 50 50)`}
              />
            ))}
            <circle cx="50" cy="50" r="8" fill="#495057" />
            <circle cx="50" cy="50" r="3.4" fill="#f8f9fa" />
          </svg>
        </div>
        <p className="hint">Atinge morișca</p>
      </div>
    </div>
  )
}
