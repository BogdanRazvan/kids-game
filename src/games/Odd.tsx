import { PickGame, Round } from '../components/PickGame'
import { CATEGORIES } from '../data/content'
import { GameProps, pick, sample, shuffle } from '../lib/game'

// All from one category except one — tap the odd one out.
export function Odd({ onBack }: GameProps) {
  function makeRound(options: number): Round {
    const [catA, catB] = sample(CATEGORIES, 2)
    const sameOnes = sample(catA, options - 1)
    const odd = pick(catB)
    const items = shuffle([...sameOnes, odd])
    return {
      prompt: 'Găsește intrusul',
      answer: odd,
      choices: items.map((e) => ({ key: e, render: <span className="emoji">{e}</span> })),
    }
  }

  return (
    <PickGame
      title="Intrusul"
      intro="Găsește intrusul"
      levelOptions={[3, 4, 5]}
      onBack={onBack}
      makeRound={makeRound}
    />
  )
}
