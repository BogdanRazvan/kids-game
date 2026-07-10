import { useEffect, useRef, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { DoneScreen } from '../components/DoneScreen'
import { Reward } from '../components/Reward'
import { GameProps, randInt, ROUNDS_PER_GAME } from '../lib/game'
import { speak, successChime, tone, wrongBuzz } from '../lib/audio'

// Watch the pads light up in order, then tap them in the same order.
const PADS = [
  { color: '#e63946', freq: 392 },
  { color: '#1d7bd6', freq: 523 },
  { color: '#2a9d54', freq: 659 },
  { color: '#f4c22b', freq: 784 },
]
const LEVELS = [3, 4, 5] // sequence length
const INTRO = 'Ține minte și repetă'

const makeSeq = (n: number) => Array.from({ length: n }, () => randInt(0, PADS.length - 1))

export function Remember({ onBack }: GameProps) {
  const [level, setLevel] = useState(0)
  const [index, setIndex] = useState(0)
  const [seq, setSeq] = useState<number[]>(() => makeSeq(LEVELS[0]))
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState<number | null>(null)
  const [watching, setWatching] = useState(true)
  const [reward, setReward] = useState(false)
  const [wrong, setWrong] = useState(false)
  const timers = useRef<number[]>([])
  const done = index >= ROUNDS_PER_GAME

  useEffect(() => {
    speak(INTRO)
  }, [])

  // Play the sequence, then hand over to the player.
  useEffect(() => {
    if (done || !watching) return
    timers.current.forEach(clearTimeout)
    timers.current = []
    let t = 700
    seq.forEach((pad) => {
      timers.current.push(window.setTimeout(() => {
        setActive(pad)
        tone(PADS[pad].freq, 0.32)
      }, t))
      timers.current.push(window.setTimeout(() => setActive(null), t + 420))
      t += 660
    })
    timers.current.push(window.setTimeout(() => setWatching(false), t))
    return () => timers.current.forEach(clearTimeout)
  }, [watching, seq, done])

  function newRound(l: number) {
    setSeq(makeSeq(LEVELS[l]))
    setProgress(0)
    setWatching(true)
  }

  function tapPad(pad: number) {
    if (watching || reward) return
    if (pad === seq[progress]) {
      tone(PADS[pad].freq, 0.2)
      setActive(pad)
      setTimeout(() => setActive(null), 200)
      const np = progress + 1
      setProgress(np)
      if (np === seq.length) {
        successChime()
        setReward(true)
        setTimeout(() => {
          setReward(false)
          setIndex((n) => n + 1)
          newRound(level)
        }, 1200)
      }
    } else {
      wrongBuzz()
      speak('Mai încearcă')
      setWrong(true)
      setTimeout(() => {
        setWrong(false)
        setProgress(0)
        setWatching(true) // replay the sequence
      }, 900)
    }
  }

  function restart() {
    setIndex(0)
    newRound(level)
  }
  function nextLevel() {
    const nl = Math.min(level + 1, LEVELS.length - 1)
    setLevel(nl)
    setIndex(0)
    newRound(nl)
  }

  return (
    <div className="game">
      <TopBar
        title="Ține minte"
        onBack={onBack}
        total={ROUNDS_PER_GAME}
        index={index}
        onReplay={done ? undefined : () => speak(INTRO)}
        hideTitle
      />
      {done ? (
        <DoneScreen
          onAgain={restart}
          onHome={onBack}
          onContinue={level < LEVELS.length - 1 ? nextLevel : undefined}
          level={level + 1}
          maxLevel={LEVELS.length}
        />
      ) : (
        <div className="game-body">
          <button className="prompt" onClick={() => speak(INTRO)}>
            <span className="prompt-icon" aria-hidden="true">
              🔊
            </span>
            {watching ? '👀 Ține minte' : '👆 Repetă'}
          </button>
          <div className={'simon-grid' + (wrong ? ' wrong' : '')}>
            {PADS.map((p, i) => (
              <button
                key={i}
                className={'simon-pad' + (active === i ? ' active' : '')}
                style={{ background: p.color }}
                onClick={() => tapPad(i)}
                aria-label={`butonul ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
      <Reward show={reward} />
    </div>
  )
}
