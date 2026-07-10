import { PickGame, Round } from '../components/PickGame'
import { COLORS } from '../data/content'
import { GameProps, pick, sample } from '../lib/game'

export function Colors({ onBack }: GameProps) {
  function makeRound(options: number): Round {
    const opts = sample(COLORS, options)
    const target = pick(opts)
    return {
      prompt: `Apasă pe culoarea ${target.name}`,
      say: target.name,
      answer: target.name,
      choices: opts.map((c) => ({
        key: c.name,
        render: (
          <span className="swatch" style={{ background: c.hex }} />
        ),
      })),
    }
  }

  return (
    <PickGame
      title="Culori"
      intro="Apasă pe culoarea"
      levelOptions={[3, 4, 5, 6]}
      onBack={onBack}
      makeRound={makeRound}
    />
  )
}
