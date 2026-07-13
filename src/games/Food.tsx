import { PickGame, Round } from '../components/PickGame'
import { FOOD_ANIMALS as FOODS } from '../data/content'
import { GameProps, pick, sample, shuffle } from '../lib/game'

// Which food does this animal eat?
export function Food({ onBack }: GameProps) {
  function makeRound(options: number): Round {
    const target = pick(FOODS)
    const others = sample(
      FOODS.filter((f) => f.food !== target.food),
      options - 1
    )
    const choices = shuffle([target, ...others])
    return {
      prompt: 'Ce mănâncă?',
      say: target.name,
      answer: target.food,
      display: <span className="emoji shadow-target">{target.animal}</span>,
      choices: choices.map((f) => ({ key: f.food, render: <span className="emoji">{f.food}</span> })),
    }
  }

  return (
    <PickGame
      title="Hrană"
      intro="Ce mănâncă?"
      levelOptions={[3, 4, 4]}
      onBack={onBack}
      makeRound={makeRound}
    />
  )
}
