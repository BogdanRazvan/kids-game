import { PickGame, Round } from '../components/PickGame'
import { GameProps, pick, randInt, sample, shuffle } from '../lib/game'

// Two small groups of the same object; tap how many there are in total.
const ADD_EMOJIS = ['🍎', '🍌', '⭐', '🎈', '🐟', '🌸', '🍓', '🐶']

export function Addition({ onBack }: GameProps) {
  function makeRound(options: number, level: number): Round {
    const maxSum = [5, 7, 9][level] ?? 9
    const a = randInt(1, Math.min(4, maxSum - 1))
    const b = randInt(1, maxSum - a)
    const sum = a + b
    const emoji = pick(ADD_EMOJIS)
    const distractors = sample(
      [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== sum),
      options - 1
    )
    const numbers = shuffle([sum, ...distractors])
    const group = (k: number) =>
      Array.from({ length: k }).map((_, i) => (
        <span key={i} className="emoji small">
          {emoji}
        </span>
      ))
    return {
      prompt: 'Care este rezultatul adunării?',
      answer: String(sum),
      display: (
        <div className="add-row">
          <span className="add-group">{group(a)}</span>
          <span className="add-op">+</span>
          <span className="add-group">{group(b)}</span>
          <span className="add-op">=</span>
          <span className="add-q">?</span>
        </div>
      ),
      choices: numbers.map((x) => ({ key: String(x), render: <span className="num">{x}</span> })),
    }
  }

  return (
    <PickGame
      title="Adunare"
      intro="Care este rezultatul adunării?"
      levelOptions={[3, 4, 4]}
      onBack={onBack}
      makeRound={makeRound}
    />
  )
}
