import { PickGame, Round } from '../components/PickGame'
import { OBJECT_EMOJIS } from '../data/content'
import { GameProps, pick, sample } from '../lib/game'

// Groups of the same object at different counts; tap the group with more / fewer.
export function MoreLess({ onBack }: GameProps) {
  function makeRound(options: number): Round {
    const emoji = pick(OBJECT_EMOJIS)
    const wantMore = Math.random() < 0.5
    const counts = sample([1, 2, 3, 4, 5, 6], options) // distinct counts
    const target = wantMore ? Math.max(...counts) : Math.min(...counts)
    const phrase = `Apasă pe ${wantMore ? 'mai multe' : 'mai puține'}`
    return {
      prompt: phrase,
      say: phrase,
      answer: String(counts.indexOf(target)),
      choices: counts.map((c, i) => ({
        key: String(i),
        render: (
          <span className="count-group">
            {Array.from({ length: c }).map((_, j) => (
              <span key={j} className="emoji small">
                {emoji}
              </span>
            ))}
          </span>
        ),
      })),
    }
  }

  return (
    <PickGame
      title="Mai mult"
      levelOptions={[2, 3]}
      onBack={onBack}
      makeRound={makeRound}
    />
  )
}
