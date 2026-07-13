import { useEffect, useRef, useState, PointerEvent as RPointerEvent } from 'react'
import { TopBar } from '../components/TopBar'
import { GameProps } from '../lib/game'
import { speak, tone } from '../lib/audio'

// Pick a plant from the tray, then tap the meadow to grow it — flowers spring up
// on a stem where you tap; trees and bushes root into the ground and pop up big.
// A little rising chime each time. No score, no fail. The broom clears it.
type Kind = 'flower' | 'tree'
type Plant = { id: string; emoji: string; kind: Kind; size: string }
const PLANTS: Plant[] = [
  { id: 'lalea', emoji: '🌷', kind: 'flower', size: '40px' },
  { id: 'floarea-soarelui', emoji: '🌻', kind: 'flower', size: '44px' },
  { id: 'trandafir', emoji: '🌹', kind: 'flower', size: '40px' },
  { id: 'floare', emoji: '🌸', kind: 'flower', size: '40px' },
  { id: 'margaretă', emoji: '🌼', kind: 'flower', size: '40px' },
  { id: 'hibiscus', emoji: '🌺', kind: 'flower', size: '42px' },
  { id: 'copac', emoji: '🌳', kind: 'tree', size: 'min(46vw, 28vh, 240px)' },
  { id: 'brad', emoji: '🌲', kind: 'tree', size: 'min(46vw, 28vh, 240px)' },
  { id: 'palmier', emoji: '🌴', kind: 'tree', size: 'min(48vw, 30vh, 250px)' },
  { id: 'cactus', emoji: '🌵', kind: 'tree', size: 'min(38vw, 24vh, 200px)' },
  { id: 'ciupercă', emoji: '🍄', kind: 'tree', size: 'min(22vw, 14vh, 120px)' },
]

type Grown = { key: number; x: number; y: number; emoji: string; kind: Kind; size: string }

export function Garden({ onBack }: GameProps) {
  const areaRef = useRef<HTMLDivElement>(null)
  const [plants, setPlants] = useState<Grown[]>([])
  const [sel, setSel] = useState(0)
  const nextId = useRef(0)

  useEffect(() => {
    speak('Grădina')
  }, [])

  function plant(e: RPointerEvent<HTMLDivElement>) {
    const rect = areaRef.current!.getBoundingClientRect()
    const p = PLANTS[sel]
    const x = ((e.clientX - rect.left) / rect.width) * 100
    // Flowers bloom where you tap (with room for a stem); trees root at the ground.
    const y = Math.min(78, Math.max(18, ((e.clientY - rect.top) / rect.height) * 100))
    setPlants((list) => [...list, { key: nextId.current++, x, y, emoji: p.emoji, kind: p.kind, size: p.size }])
    const base = p.kind === 'tree' ? [392, 523.25, 659.25] : [523.25, 659.25, 783.99]
    base.forEach((n, i) => tone(n, 0.28, 'sine', i * 0.09, 0.08))
  }

  return (
    <div className="game">
      <TopBar title="Grădina" onBack={onBack} total={0} index={0} hideTitle />
      <div className="game-body">
        <button className="prompt" onClick={() => speak('Grădina')}>
          <span className="prompt-icon" aria-hidden="true">🔊</span>
          Grădina
        </button>
        <div ref={areaRef} className="garden-area" onPointerDown={plant}>
          <div className="garden-ground" />
          {plants.map((pl) =>
            pl.kind === 'flower' ? (
              <div key={pl.key} className="garden-plant" style={{ left: `${pl.x}%`, top: `${pl.y}%` }}>
                <span className="garden-bloom" style={{ fontSize: pl.size }}>{pl.emoji}</span>
                <span className="garden-stem" />
              </div>
            ) : (
              <span key={pl.key} className="garden-tree" style={{ left: `${pl.x}%`, fontSize: pl.size }}>
                {pl.emoji}
              </span>
            )
          )}
        </div>
        <div className="paint-palette">
          {PLANTS.map((p, i) => (
            <button
              key={p.id}
              className={'stamp-pick' + (i === sel ? ' sel' : '')}
              onClick={() => setSel(i)}
              aria-label={p.id}
            >
              {p.emoji}
            </button>
          ))}
        </div>
        <div className="tool-row">
          <button className="tool-btn" onClick={() => setPlants([])}>
            🧽 Șterge
          </button>
        </div>
      </div>
    </div>
  )
}
