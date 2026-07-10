import { PickGame, Round } from '../components/PickGame'
import { OBJECT_EMOJIS } from '../data/content'
import { GameProps, randInt, sample } from '../lib/game'

// All the same except one — tap the odd one out.
export function Different({ onBack }: GameProps) {
  function makeRound(options: number): Round {
    const [same, odd] = sample(OBJECT_EMOJIS, 2)
    const oddIndex = randInt(0, options - 1)
    return {
      prompt: 'Care obiect e diferit fata de celelalte?',
      answer: String(oddIndex),
      choices: Array.from({ length: options }, (_, i) => ({
        key: String(i),
        render: <span className="emoji">{i === oddIndex ? odd : same}</span>,
      })),
    }
  }

  return (
    <PickGame
      title="Diferit"
      intro="Care obiect e diferit fata de celelalte?"
      levelOptions={[3, 4, 5]}
      onBack={onBack}
      makeRound={makeRound}
    />
  )
}
