import { PickGame, Round } from '../components/PickGame'
import { SHAPES, ShapeKind } from '../data/content'
import { GameProps, pick, sample } from '../lib/game'

function ShapeSVG({ kind, color }: { kind: ShapeKind; color: string }) {
  switch (kind) {
    case 'circle':
      return (
        <svg viewBox="0 0 100 100" className="shape">
          <circle cx="50" cy="50" r="42" fill={color} />
        </svg>
      )
    case 'square':
      return (
        <svg viewBox="0 0 100 100" className="shape">
          <rect x="10" y="10" width="80" height="80" rx="12" fill={color} />
        </svg>
      )
    case 'triangle':
      return (
        <svg viewBox="0 0 100 100" className="shape">
          <polygon points="50,10 92,88 8,88" fill={color} />
        </svg>
      )
    case 'star':
      return (
        <svg viewBox="0 0 100 100" className="shape">
          <polygon
            points="50,6 61,38 95,38 67,58 78,90 50,70 22,90 33,58 5,38 39,38"
            fill={color}
          />
        </svg>
      )
    case 'heart':
      return (
        <svg viewBox="0 0 100 100" className="shape">
          <path
            d="M50 88 L20 56 C6 42 8 20 28 18 C40 17 48 26 50 32 C52 26 60 17 72 18 C92 20 94 42 80 56 Z"
            fill={color}
          />
        </svg>
      )
    case 'rectangle':
      return (
        <svg viewBox="0 0 100 100" className="shape">
          <rect x="8" y="28" width="84" height="44" rx="10" fill={color} />
        </svg>
      )
    case 'oval':
      return (
        <svg viewBox="0 0 100 100" className="shape">
          <ellipse cx="50" cy="50" rx="44" ry="30" fill={color} />
        </svg>
      )
    case 'diamond':
      return (
        <svg viewBox="0 0 100 100" className="shape">
          <polygon points="50,8 88,50 50,92 12,50" fill={color} />
        </svg>
      )
    case 'pentagon':
      return (
        <svg viewBox="0 0 100 100" className="shape">
          <polygon points="50,8 91.8,38.4 75.9,87.6 24.1,87.6 8.1,38.4" fill={color} />
        </svg>
      )
    case 'hexagon':
      return (
        <svg viewBox="0 0 100 100" className="shape">
          <polygon points="50,6 88.1,28 88.1,72 50,94 11.9,72 11.9,28" fill={color} />
        </svg>
      )
    case 'crescent':
      return (
        <svg viewBox="0 0 100 100" className="shape">
          <path d="M64 14 A42 42 0 1 0 64 90 A32 32 0 1 1 64 14 Z" fill={color} />
        </svg>
      )
  }
}

export function Shapes({ onBack }: GameProps) {
  function makeRound(options: number): Round {
    const opts = sample(SHAPES, options)
    const target = pick(opts)
    return {
      prompt: `Găsește forma de ${target.name}`,
      say: target.name,
      answer: target.name,
      choices: opts.map((s) => ({
        key: s.name,
        render: <ShapeSVG kind={s.kind} color={s.color} />,
      })),
    }
  }

  return (
    <PickGame
      title="Forme"
      intro="Găsește forma de"
      levelOptions={[3, 4, 5, 6]}
      onBack={onBack}
      makeRound={makeRound}
    />
  )
}
