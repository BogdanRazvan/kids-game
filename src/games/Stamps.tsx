import { useEffect, useRef, useState, PointerEvent as RPointerEvent } from 'react'
import { TopBar } from '../components/TopBar'
import { GameProps } from '../lib/game'
import { speak, tone } from '../lib/audio'

// Pick a picture, then tap the meadow to plant it wherever you like. No score,
// no wrong answer — just decorate the scene. Undo lifts the last one; the broom
// clears them all.
const STAMPS = ['⭐', '🌸', '🦋', '🐞', '🌈', '🍄', '🐢', '🌻', '🐠', '❤️', '🌙', '🐝']

type Placed = { id: number; x: number; y: number; emoji: string; rot: number; size: number }

export function Stamps({ onBack }: GameProps) {
  const areaRef = useRef<HTMLDivElement>(null)
  const [sel, setSel] = useState(0)
  const [placed, setPlaced] = useState<Placed[]>([])
  const nextId = useRef(0)

  useEffect(() => {
    speak('Ștampile')
  }, [])

  function place(e: RPointerEvent<HTMLDivElement>) {
    const rect = areaRef.current!.getBoundingClientRect()
    setPlaced((p) => [
      ...p,
      {
        id: nextId.current++,
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
        emoji: STAMPS[sel],
        rot: -18 + Math.random() * 36,
        size: 40 + Math.random() * 24,
      },
    ])
    tone(560 + Math.random() * 240, 0.09, 'sine', 0, 0.1)
  }

  return (
    <div className="game">
      <TopBar title="Ștampile" onBack={onBack} total={0} index={0} hideTitle />
      <div className="game-body">
        <button className="prompt" onClick={() => speak('Ștampile')}>
          <span className="prompt-icon" aria-hidden="true">🔊</span>
          Ștampile
        </button>
        <div ref={areaRef} className="stamp-scene" onPointerDown={place}>
          {placed.map((s) => (
            <span
              key={s.id}
              className="stamp-mark"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                fontSize: s.size,
                transform: `translate(-50%, -50%) rotate(${s.rot}deg)`,
              }}
            >
              {s.emoji}
            </span>
          ))}
        </div>
        <div className="paint-palette">
          {STAMPS.map((e, i) => (
            <button
              key={e}
              className={'stamp-pick' + (i === sel ? ' sel' : '')}
              onClick={() => setSel(i)}
              aria-label={`ștampilă ${e}`}
            >
              {e}
            </button>
          ))}
        </div>
        <div className="tool-row">
          <button className="tool-btn" onClick={() => setPlaced((p) => p.slice(0, -1))}>
            ↩️ Înapoi
          </button>
          <button className="tool-btn" onClick={() => setPlaced([])}>
            🧽 Șterge
          </button>
        </div>
      </div>
    </div>
  )
}
