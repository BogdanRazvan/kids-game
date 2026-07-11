import { PickGame, Round } from '../components/PickGame'
import { COUNT_ITEMS } from '../data/content'
import { GameProps, pick, randInt, sample, shuffle } from '../lib/game'

export function Counting({ onBack }: GameProps) {
  function makeRound(options: number): Round {
    const item = pick(COUNT_ITEMS)
    // More choices → also count higher, so later levels are genuinely harder.
    const maxN = options + 1
    const n = randInt(2, maxN)
    const pool = Array.from({ length: maxN }, (_, i) => i + 1).filter((x) => x !== n)
    const distractors = sample(pool, options - 1)
    const numbers = shuffle([n, ...distractors])

    return {
      prompt: 'Apasă pe numărul potrivit',
      answer: String(n),
      display: (
        <div className="count-objects">
          {Array.from({ length: n }).map((_, i) => (
            <span key={i} className="emoji">
              {item.emoji}
            </span>
          ))}
        </div>
      ),
      choices: numbers.map((x) => ({
        key: String(x),
        render: <span className="num">{x}</span>,
      })),
    }
  }

  return (
    <PickGame
      title="Numărăm"
      intro="Apasă pe numărul potrivit"
      levelOptions={[3, 4, 5]}
      onBack={onBack}
      makeRound={makeRound}
    />
  )
}
