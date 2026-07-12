import { PickGame, Round } from '../components/PickGame'
import { GameProps, pick, sample } from '../lib/game'
import {
  BODY_PARTS,
  EMOTIONS,
  JOBS,
  OPPOSITES,
  PickItem,
  VEHICLES,
  WEATHER,
} from '../data/content'

// Shared "listen, then tap the named picture" game. `stem` is spoken (once) then
// the changing item name each round: e.g. "Găsește" → "soarele" → "ploaia"…
function topicGame(title: string, stem: string, list: PickItem[], levelOptions: number[]) {
  return function TopicGame({ onBack }: GameProps) {
    function makeRound(options: number): Round {
      const opts = sample(list, options)
      const target = pick(opts)
      return {
        prompt: `${stem} ${target.name}`,
        say: target.name,
        answer: target.name,
        choices: opts.map((o) => ({
          key: o.name,
          render: <span className="emoji">{o.emoji}</span>,
        })),
      }
    }
    return (
      <PickGame
        title={title}
        intro={stem}
        levelOptions={levelOptions}
        onBack={onBack}
        makeRound={makeRound}
      />
    )
  }
}

export const BodyParts = topicGame('Corpul meu', 'Atinge', BODY_PARTS, [3, 4, 5, 6])
export const Emotions = topicGame('Emoții', 'Atinge fața', EMOTIONS, [3, 4, 5])
export const Weather = topicGame('Vremea', 'Găsește', WEATHER, [3, 4, 5])
export const Vehicles = topicGame('Vehicule', 'Găsește', VEHICLES, [3, 4, 5, 6])
export const Jobs = topicGame('Meserii', 'Găsește', JOBS, [3, 4, 5])
export const Opposites = topicGame('Opuse', 'Găsește ce e', OPPOSITES, [3, 4, 5])
