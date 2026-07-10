import { PickGame, Round } from '../components/PickGame'
import { OBJECT_EMOJIS } from '../data/content'
import { GameProps, pick, sample } from '../lib/game'

// Match the colourful object at the top to its black silhouette below.
export function Shadows({ onBack }: GameProps) {
  function makeRound(options: number): Round {
    const opts = sample(OBJECT_EMOJIS, options)
    const target = pick(opts)
    return {
      prompt: 'Găsește umbra',
      answer: target,
      display: <span className="emoji shadow-target">{target}</span>,
      choices: opts.map((e) => ({
        key: e,
        render: <span className="emoji silhouette">{e}</span>,
      })),
    }
  }

  return (
    <PickGame
      title="Umbre"
      intro="Găsește umbra"
      levelOptions={[3, 4, 5]}
      onBack={onBack}
      makeRound={makeRound}
    />
  )
}
