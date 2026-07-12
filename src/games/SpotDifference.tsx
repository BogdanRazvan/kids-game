import { useEffect, useState, MouseEvent } from 'react'
import { TopBar } from '../components/TopBar'
import { DoneScreen } from '../components/DoneScreen'
import { Reward } from '../components/Reward'
import { GameProps, shuffle } from '../lib/game'
import { speak, successChime, wrongBuzz } from '../lib/audio'
import { DIFF_PAIRS } from './diffPairs'

// Two versions of the same picture side by side; tap the spots that differ.
const INTRO = 'Găsește diferențele'
// One round per pair, in a shuffled order, so no picture repeats in a session.
const ROUNDS = DIFF_PAIRS.length

export function SpotDifference({ onBack }: GameProps) {
  const [index, setIndex] = useState(0)
  const [order, setOrder] = useState<number[]>(() => shuffle(DIFF_PAIRS.map((_, i) => i)))
  const [found, setFound] = useState<Set<number>>(new Set())
  const [reward, setReward] = useState(false)
  const [wrong, setWrong] = useState(false)
  const done = index >= ROUNDS
  const pair = DIFF_PAIRS[order[index % order.length]]

  useEffect(() => {
    if (!done && index === 0) speak(INTRO)
  }, [index, done])

  function clickScene(e: MouseEvent<HTMLDivElement>) {
    if (reward) return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const hit = pair.diffs.findIndex((d, i) => {
      if (found.has(i)) return false
      // Elliptical hit test: circle when ry is omitted (ry defaults to r).
      const nx = (px - d.x) / d.r
      const ny = (py - d.y) / (d.ry ?? d.r)
      return nx * nx + ny * ny < 1
    })
    if (hit >= 0) {
      const nf = new Set(found)
      nf.add(hit)
      setFound(nf)
      successChime()
      if (nf.size === pair.diffs.length) {
        setReward(true)
        setTimeout(() => {
          setReward(false)
          setFound(new Set())
          setIndex((n) => n + 1)
        }, 1300)
      }
    } else {
      wrongBuzz()
      speak('Mai încearcă')
      setWrong(true)
      setTimeout(() => setWrong(false), 400)
    }
  }

  function restart() {
    setIndex(0)
    setOrder(shuffle(DIFF_PAIRS.map((_, i) => i)))
    setFound(new Set())
  }

  function scene(src: string) {
    return (
      <div className={'scene' + (wrong ? ' wrong' : '')} onClick={clickScene}>
        <div className="scene-img" style={{ backgroundImage: `url(${src})` }} />
        {[...found].map((i) => {
          const d = pair.diffs[i]
          const ellipse = d.ry != null
          return (
            <div
              key={i}
              className="spot-ring"
              style={{
                left: `${d.x * 100}%`,
                top: `${d.y * 100}%`,
                width: `${d.r * 150}%`,
                ...(ellipse
                  ? { height: `${d.ry! * 150}%` }
                  : { height: 'auto', aspectRatio: '1' }),
              }}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="game">
      <TopBar
        title="Diferențe"
        onBack={onBack}
        total={ROUNDS}
        index={index}
        onReplay={done ? undefined : () => speak(INTRO)}
        hideTitle
      />
      {done ? (
        <DoneScreen onAgain={restart} onHome={onBack} level={1} maxLevel={1} />
      ) : (
        <div className="game-body">
          <button className="prompt" onClick={() => speak(INTRO)}>
            <span className="prompt-icon" aria-hidden="true">
              🔊
            </span>
            Găsește diferențele
          </button>
          <div className="diff-progress" aria-label={`${found.size} din ${pair.diffs.length}`}>
            {pair.diffs.map((_, i) => (
              <span key={i} className={'diff-dot' + (i < found.size ? ' on' : '')} />
            ))}
          </div>
          <div className="spot-pair">
            {scene(pair.a)}
            {scene(pair.b)}
          </div>
        </div>
      )}
      <Reward show={reward} />
    </div>
  )
}
