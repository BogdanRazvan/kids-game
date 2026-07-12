import { useEffect, useRef, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { GameProps } from '../lib/game'
import { speak, tone } from '../lib/audio'

// Bubbles drift up; tap to pop them with a little sound. Pure cause-and-effect.
const COLORS = ['#4dabf7', '#f783ac', '#ffd43b', '#69db7c', '#b197fc', '#ff922b', '#3bc9db']

type Bubble = { id: number; x: number; size: number; color: string; dur: number; popped?: boolean }

export function Bubbles({ onBack }: GameProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const nextId = useRef(0)

  useEffect(() => {
    const spawn = () => {
      const size = 44 + Math.random() * 60
      setBubbles((bs) => {
        // Keep the field from overflowing on slow taps.
        const trimmed = bs.length > 14 ? bs.slice(bs.length - 14) : bs
        return [
          ...trimmed,
          {
            id: nextId.current++,
            x: 4 + Math.random() * 88,
            size,
            color: COLORS[(Math.random() * COLORS.length) | 0],
            dur: 6 + Math.random() * 4,
          },
        ]
      })
    }
    spawn()
    const iv = window.setInterval(spawn, 850)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    speak('Sparge bulele')
  }, [])

  function remove(id: number) {
    setBubbles((bs) => bs.filter((b) => b.id !== id))
  }

  function pop(b: Bubble) {
    if (b.popped) return
    tone(520 + Math.random() * 400, 0.09, 'sine', 0, 0.12)
    setBubbles((bs) => bs.map((x) => (x.id === b.id ? { ...x, popped: true } : x)))
    window.setTimeout(() => remove(b.id), 180)
  }

  return (
    <div className="game">
      <TopBar title="Bule" onBack={onBack} total={0} index={0} hideTitle />
      <div className="bubbles-head">
        <button className="prompt" onClick={() => speak('Sparge bulele')}>
          <span className="prompt-icon" aria-hidden="true">🔊</span>
          Sparge bulele
        </button>
      </div>
      <div className="bubbles-area">
        {bubbles.map((b) => (
          <button
            key={b.id}
            className={'bubble' + (b.popped ? ' pop' : '')}
            style={{
              left: `${b.x}%`,
              width: b.size,
              height: b.size,
              color: b.color,
              ['--dur' as string]: `${b.dur}s`,
            } as React.CSSProperties}
            onPointerDown={() => pop(b)}
            onAnimationEnd={() => !b.popped && remove(b.id)}
            aria-label="bulă"
          />
        ))}
      </div>
    </div>
  )
}
