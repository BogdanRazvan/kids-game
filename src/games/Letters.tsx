import { PickGame, Round } from '../components/PickGame'
import { LETTERS } from '../data/content'
import { GameProps, pick, sample } from '../lib/game'

// Show a letter; tap the matching letter.
export function Letters({ onBack }: GameProps) {
  function makeRound(options: number, level: number): Round {
    const opts = sample(LETTERS, options)
    const target = pick(opts)
    return {
      prompt: 'Găsește litera',
      say: target, // the letter, spoken by its Romanian name
      answer: target,
      // Level 1 shows the target (matching); higher levels hide it, so the child
      // must recognise the letter from its spoken name alone.
      display: level === 0 ? <span className="big-letter target">{target}</span> : undefined,
      choices: opts.map((l) => ({ key: l, render: <span className="big-letter">{l}</span> })),
    }
  }

  return (
    <PickGame
      title="Litere"
      intro="Găsește litera"
      levelOptions={[3, 4, 5]}
      onBack={onBack}
      makeRound={makeRound}
    />
  )
}
