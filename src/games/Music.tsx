import { PickGame, Round } from '../components/PickGame'
import { INSTRUMENTS } from '../data/content'
import { GameProps, pick, sample } from '../lib/game'

// Hear a real instrument sound; tap the instrument that made it.
export function Music({ onBack }: GameProps) {
  function makeRound(options: number): Round {
    const opts = sample(INSTRUMENTS, options)
    const target = pick(opts)
    return {
      prompt: 'Ce instrument se aude?',
      say: `sound:${target.slug}`, // plays the real instrument clip (see gen-audio.mjs)
      answer: target.slug,
      choices: opts.map((i) => ({ key: i.slug, render: <span className="emoji">{i.emoji}</span> })),
    }
  }

  return (
    <PickGame
      title="Muzică"
      intro="Ce instrument se aude?"
      levelOptions={[3, 4, 5]}
      onBack={onBack}
      makeRound={makeRound}
    />
  )
}
