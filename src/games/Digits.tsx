import { PickGame, Round } from '../components/PickGame'
import { DIGITS } from '../data/content'
import { GameProps, pick, sample } from '../lib/game'

// Show a digit; tap the matching digit.
export function Digits({ onBack }: GameProps) {
  function makeRound(options: number, level: number): Round {
    const opts = sample(DIGITS, options)
    const target = pick(opts)
    return {
      prompt: 'Găsește cifra',
      say: target, // spoken so the digit can be found by ear when hidden
      answer: target,
      // Level 1 shows the target; higher levels hide it (find it by its spoken name).
      display: level === 0 ? <span className="big-letter target">{target}</span> : undefined,
      choices: opts.map((d) => ({ key: d, render: <span className="big-letter">{d}</span> })),
    }
  }

  return (
    <PickGame
      title="Cifre"
      intro="Găsește cifra"
      levelOptions={[3, 4, 5]}
      onBack={onBack}
      makeRound={makeRound}
    />
  )
}
