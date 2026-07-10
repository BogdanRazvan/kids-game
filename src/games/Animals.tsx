import { PickGame, Round } from '../components/PickGame'
import { ANIMALS } from '../data/content'
import { GameProps, pick, sample } from '../lib/game'

export function Animals({ onBack }: GameProps) {
  function makeRound(options: number): Round {
    const opts = sample(ANIMALS, options)
    const target = pick(opts)
    return {
      prompt: `Cine face „${target.sound}"?`,
      say: `sound:${target.name}`, // plays the real animal sound (see gen-audio.mjs)
      answer: target.name,
      choices: opts.map((a) => ({
        key: a.name,
        render: <span className="emoji">{a.emoji}</span>,
      })),
    }
  }

  return (
    <PickGame
      title="Animale"
      intro="Cine face?"
      levelOptions={[3, 4, 5, 6]}
      onBack={onBack}
      makeRound={makeRound}
    />
  )
}
