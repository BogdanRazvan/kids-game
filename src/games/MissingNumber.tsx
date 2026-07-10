import { PickGame, Round } from '../components/PickGame'
import { GameProps, randInt, sample, shuffle } from '../lib/game'

// A short run of consecutive numbers with one missing; tap the missing one.
export function MissingNumber({ onBack }: GameProps) {
  function makeRound(options: number, level: number): Round {
    const maxStart = [3, 5, 7][level] ?? 5
    const start = randInt(1, maxStart)
    const seq = Array.from({ length: 5 }, (_, i) => start + i)
    const blankIdx = randInt(1, 3)
    const missing = seq[blankIdx]
    const visible = seq.filter((_, i) => i !== blankIdx)
    const pool = Array.from({ length: 12 }, (_, i) => i + 1).filter((x) => x !== missing && !visible.includes(x))
    const numbers = shuffle([missing, ...sample(pool, options - 1)])
    return {
      prompt: 'Ce număr lipsește?',
      answer: String(missing),
      display: (
        <div className="seq-row">
          {seq.map((n, i) =>
            i === blankIdx ? (
              <span key={i} className="seq-blank">
                ?
              </span>
            ) : (
              <span key={i} className="num">
                {n}
              </span>
            )
          )}
        </div>
      ),
      choices: numbers.map((x) => ({ key: String(x), render: <span className="num">{x}</span> })),
    }
  }

  return (
    <PickGame
      title="Numere lipsă"
      intro="Ce număr lipsește?"
      levelOptions={[3, 4, 4]}
      onBack={onBack}
      makeRound={makeRound}
    />
  )
}
