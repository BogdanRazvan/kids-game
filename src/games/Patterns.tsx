import { PickGame, Round } from '../components/PickGame'
import { PATTERN_EMOJIS } from '../data/content'
import { GameProps, sample, shuffle } from '../lib/game'

// A repeating ABAB pattern — tap what comes next (always A).
export function Patterns({ onBack }: GameProps) {
  function makeRound(options: number): Round {
    const [a, b] = sample(PATTERN_EMOJIS, 2)
    const others = sample(
      PATTERN_EMOJIS.filter((e) => e !== a && e !== b),
      options - 2
    )
    const choices = shuffle([a, b, ...others]) // a is the answer, b is a natural distractor
    return {
      prompt: 'Ce formă urmează?',
      answer: a,
      display: (
        <div className="pattern-seq">
          {[a, b, a, b].map((e, i) => (
            <span key={i} className="emoji">
              {e}
            </span>
          ))}
          <span className="pattern-next">❓</span>
        </div>
      ),
      choices: choices.map((e) => ({ key: e, render: <span className="emoji">{e}</span> })),
    }
  }

  return (
    <PickGame
      title="Modele"
      intro="Ce formă urmează?"
      levelOptions={[2, 3, 4]}
      onBack={onBack}
      makeRound={makeRound}
    />
  )
}
