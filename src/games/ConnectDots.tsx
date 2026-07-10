import { useEffect, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { DoneScreen } from '../components/DoneScreen'
import { Reward } from '../components/Reward'
import { GameProps, pick, ROUNDS_PER_GAME } from '../lib/game'
import { celebrateChime, speak, tone, wrongBuzz } from '../lib/audio'

// Tap the numbered dots in order — a line joins them and reveals a picture.
const INTRO = 'Unește punctele în ordine'
const LEVELS = [5, 7, 10] // max dots allowed at each level

type Pt = [number, number]
type Shape = { name: string; color: string; pts: Pt[] }

const SHAPES: Shape[] = [
  // ≤5 dots — easiest
  { name: 'munte', color: '#4c6ef5', pts: [[50, 25], [80, 82], [20, 82]] },
  { name: 'pătrat', color: '#12b886', pts: [[28, 28], [72, 28], [72, 72], [28, 72]] },
  { name: 'zmeu', color: '#e8348c', pts: [[50, 18], [78, 48], [50, 90], [22, 48]] },
  { name: 'pahar', color: '#15aabf', pts: [[30, 30], [70, 30], [60, 82], [40, 82]] },
  { name: 'casă', color: '#f59f00', pts: [[30, 88], [30, 50], [50, 25], [70, 50], [70, 88]] },
  { name: 'diamant', color: '#e64980', pts: [[30, 32], [70, 32], [85, 48], [50, 88], [15, 48]] },
  // 6–7 dots
  { name: 'barcă', color: '#1d7bd6', pts: [[30, 86], [70, 86], [80, 68], [54, 68], [54, 22], [24, 68]] },
  { name: 'rachetă', color: '#f03e3e', pts: [[50, 18], [64, 45], [64, 78], [50, 90], [36, 78], [36, 45]] },
  { name: 'balon', color: '#e64980', pts: [[50, 20], [68, 36], [62, 60], [50, 70], [38, 60], [32, 36]] },
  { name: 'carte', color: '#7048e8', pts: [[24, 32], [50, 26], [76, 32], [76, 80], [50, 74], [24, 80]] },
  { name: 'steag', color: '#f03e3e', pts: [[30, 20], [72, 20], [64, 32], [72, 44], [30, 44], [30, 88]] },
  { name: 'mașină', color: '#e8590c', pts: [[20, 78], [20, 60], [40, 60], [48, 46], [72, 60], [80, 60], [80, 78]] },
  { name: 'pește', color: '#f76707', pts: [[28, 52], [52, 34], [72, 44], [90, 30], [90, 74], [72, 60], [52, 70]] },
  { name: 'brad', color: '#2f9e44', pts: [[50, 16], [34, 44], [44, 44], [24, 80], [76, 80], [56, 44], [66, 44]] },
  { name: 'coroană', color: '#f7c600', pts: [[24, 74], [24, 40], [38, 56], [50, 34], [62, 56], [76, 40], [76, 74]] },
  { name: 'săgeată', color: '#7048e8', pts: [[20, 40], [55, 40], [55, 25], [85, 50], [55, 75], [55, 60], [20, 60]] },
  { name: 'fulger', color: '#fab005', pts: [[52, 14], [34, 52], [48, 52], [38, 86], [70, 44], [54, 44], [64, 14]] },
  { name: 'clopoțel', color: '#f59f00', pts: [[50, 20], [62, 28], [68, 60], [74, 70], [26, 70], [32, 60], [38, 28]] },
  // 8–10 dots — hardest
  { name: 'inimă', color: '#e8348c', pts: [[50, 34], [38, 22], [22, 26], [20, 42], [50, 76], [80, 42], [78, 26], [62, 22]] },
  { name: 'fluture', color: '#845ef7', pts: [[50, 30], [32, 18], [18, 34], [32, 50], [50, 40], [68, 50], [82, 34], [68, 18]] },
  { name: 'pisică', color: '#f76707', pts: [[30, 42], [26, 22], [42, 34], [58, 34], [74, 22], [70, 42], [78, 60], [50, 80], [22, 60]] },
  { name: 'stea', color: '#f7c600', pts: [[50, 15], [59, 38], [83, 39], [64, 55], [71, 78], [50, 65], [29, 78], [36, 55], [17, 39], [41, 38]] },
]

export function ConnectDots({ onBack }: GameProps) {
  const [level, setLevel] = useState(0)
  const [index, setIndex] = useState(0)
  const [shape, setShape] = useState<Shape>(() => pickShape(0))
  const [next, setNext] = useState(0) // index of the dot to tap next
  const [complete, setComplete] = useState(false)
  const [reward, setReward] = useState(false)
  const done = index >= ROUNDS_PER_GAME

  // Speak the instruction when the game opens.
  useEffect(() => {
    speak(INTRO)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function newRound(l: number) {
    setShape(pickShape(l))
    setNext(0)
    setComplete(false)
  }

  function tapDot(i: number) {
    if (complete || reward) return
    if (i !== next) {
      wrongBuzz()
      return
    }
    tone(360 + i * 45, 0.14, 'triangle')
    const n = next + 1
    setNext(n)
    if (n === shape.pts.length) {
      setComplete(true)
      celebrateChime()
      speak('Bravo!')
      setReward(true)
      setTimeout(() => {
        setReward(false)
        setIndex((k) => k + 1)
        newRound(level)
      }, 1500)
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

  // Path through the dots connected so far (closed once complete).
  const drawn = shape.pts.slice(0, next)
  const linePts = drawn.map((p) => p.join(',')).join(' ')

  return (
    <div className="game">
      <TopBar
        title="Unește punctele"
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
            Unește punctele în ordine
          </button>
          <div className="dots-board">
            <svg viewBox="0 0 100 100" className="dots-svg">
              {complete && (
                <polygon
                  className="dots-fill"
                  points={shape.pts.map((p) => p.join(',')).join(' ')}
                  fill={shape.color}
                />
              )}
              {drawn.length > 1 && (
                <polyline
                  className="dots-line"
                  points={linePts}
                  fill="none"
                  stroke={shape.color}
                />
              )}
              {complete && (
                <line
                  className="dots-line"
                  x1={shape.pts[shape.pts.length - 1][0]}
                  y1={shape.pts[shape.pts.length - 1][1]}
                  x2={shape.pts[0][0]}
                  y2={shape.pts[0][1]}
                  stroke={shape.color}
                />
              )}
              {!complete &&
                shape.pts.map((p, i) => {
                  const state = i < next ? 'on' : i === next ? 'next' : 'off'
                  return (
                    <g
                      key={i}
                      className={'dots-dot ' + state}
                      onClick={() => tapDot(i)}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <circle cx={p[0]} cy={p[1]} r={8.5} className="dots-hit" />
                      <circle cx={p[0]} cy={p[1]} r={5.5} className="dots-face" />
                      <text x={p[0]} y={p[1] + 0.4} className="dots-num">
                        {i + 1}
                      </text>
                    </g>
                  )
                })}
            </svg>
          </div>
        </div>
      )}
      <Reward show={reward} />
    </div>
  )
}

function pickShape(level: number): Shape {
  const max = LEVELS[level]
  const eligible = SHAPES.filter((s) => s.pts.length <= max)
  return pick(eligible.length ? eligible : SHAPES)
}
