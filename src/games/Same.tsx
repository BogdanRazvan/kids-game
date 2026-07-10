import { PickGame, Round } from '../components/PickGame'
import { OBJECT_EMOJIS } from '../data/content'
import { GameProps, pick, randInt, sample } from '../lib/game'

// A random tilt (always at least 20°) so matching needs real shape recognition.
function spin() {
  const a = randInt(20, 90)
  return { display: 'inline-block', transform: `rotate(${randInt(0, 1) ? a : -a}deg)` }
}

// Show one object; tap the identical one among the choices.
export function Same({ onBack }: GameProps) {
  function makeRound(options: number): Round {
    const opts = sample(OBJECT_EMOJIS, options)
    const target = pick(opts)
    return {
      prompt: 'Găsește obiectul din poză',
      answer: target,
      display: (
        <span className="emoji shadow-target" style={spin()}>
          {target}
        </span>
      ),
      choices: opts.map((e) => ({
        key: e,
        render: (
          <span className="emoji" style={spin()}>
            {e}
          </span>
        ),
      })),
    }
  }

  return (
    <PickGame
      title="La fel"
      intro="Găsește obiectul din poză"
      levelOptions={[3, 4, 5]}
      onBack={onBack}
      makeRound={makeRound}
    />
  )
}
