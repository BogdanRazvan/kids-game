import { ReactNode, useEffect, useState } from 'react'
import { TopBar } from './TopBar'
import { DoneScreen } from './DoneScreen'
import { Reward } from './Reward'
import { StickerReward } from './StickerReward'
import { ROUNDS_PER_GAME } from '../lib/game'
import { speak, speakSequence, wrongBuzz } from '../lib/audio'
import { earnNewSticker } from '../lib/collection'
import type { Sticker } from '../data/stickers'

// How often a correct answer drops a brand-new sticker. Not every time — the
// surprise is what keeps it exciting.
const STICKER_CHANCE = 0.5

export type Choice = { key: string; render: ReactNode }

export type Round = {
  prompt: string
  // The changing word spoken each round. Omit for a silent game (e.g. Counting,
  // where the child just counts what's on screen).
  say?: string
  answer: string
  choices: Choice[]
  display?: ReactNode
}

type Props = {
  title: string
  onBack: () => void
  // Builds one round with the given number of on-screen choices and the current
  // level index (0-based) — e.g. to hide the target on harder levels.
  makeRound: (options: number, level: number) => Round
  // Number of choices at each level, e.g. [3, 4, 5, 6] — four levels, getting
  // harder. Completing a level unlocks "Continuă" to the next one.
  levelOptions: number[]
  // Spoken once when the game opens; each round then speaks only round.say (the
  // changing word), so the child hears e.g. "Atinge culoarea" then "albastru",
  // "verde"… instead of the full sentence every time.
  intro?: string
}

// Shared engine for the "listen, then tap the right one" games:
// Colors, Counting, Shapes and Animals all plug their own round into this.
export function PickGame({ title, onBack, makeRound, levelOptions, intro }: Props) {
  const [level, setLevel] = useState(0)
  const [index, setIndex] = useState(0)
  const [round, setRound] = useState<Round>(() => makeRound(levelOptions[0], 0))
  const [reward, setReward] = useState(false)
  const [sticker, setSticker] = useState<Sticker | null>(null)
  const [wrongKey, setWrongKey] = useState<string | null>(null)
  const options = levelOptions[level]
  const done = index >= ROUNDS_PER_GAME

  // The full prompt: intro stem + the round's word. Used on entry and whenever
  // the child asks to hear it again. Empty when the game has no speech.
  const canSpeak = Boolean(intro) || Boolean(round.say)
  const sayPrompt = () => {
    const parts = [intro, round.say].filter(Boolean) as string[]
    if (parts.length) speakSequence(parts)
  }

  useEffect(() => {
    if (done) return
    // First round (and after restart) plays the instruction; later rounds speak
    // only the changing word. Silent games say nothing.
    if (index === 0) sayPrompt()
    else if (round.say) speak(round.say)
  }, [round, done])

  function choose(key: string) {
    if (reward) return
    if (key === round.answer) {
      const earned = Math.random() < STICKER_CHANCE ? earnNewSticker() : null
      setReward(true)
      setSticker(earned)
      // No spoken praise on success — the success chime (Reward) is the reward.
      setTimeout(() => {
        setReward(false)
        setSticker(null)
        setIndex((i) => i + 1)
        setRound(makeRound(options, level))
      }, earned ? 2000 : 1100)
    } else {
      wrongBuzz()
      setWrongKey(key)
      speak('Mai încearcă')
      setTimeout(() => setWrongKey(null), 450)
    }
  }

  // Replay the same level.
  function restart() {
    setIndex(0)
    setRound(makeRound(options, level))
  }

  // Advance to the next (harder) level.
  function nextLevel() {
    const nl = Math.min(level + 1, levelOptions.length - 1)
    setLevel(nl)
    setIndex(0)
    setRound(makeRound(levelOptions[nl], nl))
  }

  return (
    <div className="game">
      <TopBar
        title={title}
        onBack={onBack}
        total={ROUNDS_PER_GAME}
        index={index}
        onReplay={done || !canSpeak ? undefined : sayPrompt}
        hideTitle
      />
      {done ? (
        <DoneScreen
          onAgain={restart}
          onHome={onBack}
          onContinue={level < levelOptions.length - 1 ? nextLevel : undefined}
          level={level + 1}
          maxLevel={levelOptions.length}
        />
      ) : (
        <div className="game-body">
          <button className="prompt" onClick={canSpeak ? sayPrompt : undefined}>
            {canSpeak && (
              <span className="prompt-icon" aria-hidden="true">
                🔊
              </span>
            )}
            {round.prompt}
          </button>
          {round.display}
          <div className="choices">
            {round.choices.map((c) => (
              <button
                key={c.key}
                className={'choice' + (wrongKey === c.key ? ' shake' : '')}
                onClick={() => choose(c.key)}
                aria-label={c.key}
              >
                {c.render}
              </button>
            ))}
          </div>
        </div>
      )}
      <Reward show={reward} />
      <StickerReward sticker={sticker} />
    </div>
  )
}
