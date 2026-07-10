import { PickGame, Round } from '../components/PickGame'
import { SIZE_EMOJIS } from '../data/content'
import { GameProps, pick, shuffle } from '../lib/game'

// The same object shown at different sizes; tap the biggest or smallest.
const SIZES = ['44px', '72px', '108px', '148px']

export function Sizes({ onBack }: GameProps) {
  function makeRound(options: number): Round {
    const emoji = pick(SIZE_EMOJIS)
    const wantBig = Math.random() < 0.5
    const pool = SIZES.slice(0, options) // distinct sizes, ascending
    const target = wantBig ? pool[pool.length - 1] : pool[0]
    const arrangement = shuffle(pool)
    const word = wantBig ? 'cel mare' : 'cel mic'
    return {
      prompt: `Apasă pe obiectul ${word}`,
      say: word, // intro is spoken once; each round only says "cel mare" / "cel mic"
      answer: String(arrangement.indexOf(target)),
      choices: arrangement.map((sz, i) => ({
        key: String(i),
        render: (
          <span className="emoji" style={{ fontSize: sz }}>
            {emoji}
          </span>
        ),
      })),
    }
  }

  return (
    <PickGame
      title="Mărime"
      intro="Apasă pe obiectul"
      levelOptions={[2, 3, 4]}
      onBack={onBack}
      makeRound={makeRound}
    />
  )
}
