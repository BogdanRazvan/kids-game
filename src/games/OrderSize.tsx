import { useEffect, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { DoneScreen } from '../components/DoneScreen'
import { Reward } from '../components/Reward'
import { GameProps, pick, ROUNDS_PER_GAME, shuffle } from '../lib/game'
import { speak, successChime, wrongBuzz } from '../lib/audio'

// Tap the objects in order from smallest to largest.
const LEVELS = [4, 5, 6]
const INTRO = 'Apasă pe obiecte, în ordine, de la mic la mare'
const SIZES = [30, 48, 68, 90, 114, 140] // px, one per rank

// Each round picks a theme: an object + a matching scene (fish→pond, ⭐→night…).
const THEMES = [
  { emoji: '🐟', bg: 'linear-gradient(#74c0fc, #1971c2)' },
  { emoji: '⭐', bg: 'linear-gradient(#2b2d64, #17173a)' },
  { emoji: '🎈', bg: 'linear-gradient(#a9e0ff, #e4f6ff)' },
  { emoji: '🌸', bg: 'linear-gradient(#8fd06a, #4a9f45)' },
  { emoji: '🍎', bg: 'linear-gradient(#ffe066, #f59f00)' },
  { emoji: '🦋', bg: 'linear-gradient(#b2f2bb, #51cf66)' },
]

type Item = { rank: number; size: number; x: number; y: number }

// Scatter the objects around the area on a jittered grid (spread, little overlap).
function makeItems(n: number): Item[] {
  const cols = Math.ceil(Math.sqrt(n))
  const rows = Math.ceil(n / cols)
  const cells = shuffle(Array.from({ length: cols * rows }, (_, k) => k)).slice(0, n)
  return Array.from({ length: n }, (_, i) => {
    const gx = cells[i] % cols
    const gy = Math.floor(cells[i] / cols)
    const x = ((gx + 0.5) / cols) * 100 + (Math.random() - 0.5) * (50 / cols)
    const y = ((gy + 0.5) / rows) * 100 + (Math.random() - 0.5) * (50 / rows)
    return {
      rank: i,
      size: SIZES[i],
      x: Math.max(12, Math.min(88, x)),
      y: Math.max(16, Math.min(84, y)),
    }
  })
}

export function OrderSize({ onBack }: GameProps) {
  const [level, setLevel] = useState(0)
  const [index, setIndex] = useState(0)
  const [items, setItems] = useState<Item[]>(() => makeItems(LEVELS[0]))
  const [theme, setTheme] = useState(() => pick(THEMES))
  const [next, setNext] = useState(0) // expected rank
  const [reward, setReward] = useState(false)
  const [wrongRank, setWrongRank] = useState<number | null>(null)
  const done = index >= ROUNDS_PER_GAME

  useEffect(() => {
    if (!done && index === 0) speak(INTRO)
  }, [items, done])

  function newRound(l: number) {
    setItems(makeItems(LEVELS[l]))
    setTheme(pick(THEMES))
    setNext(0)
  }

  function tap(rank: number) {
    if (reward || rank < next) return
    if (rank === next) {
      successChime()
      const nn = next + 1
      setNext(nn)
      if (nn === items.length) {
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
      setWrongRank(rank)
      setTimeout(() => setWrongRank(null), 450)
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
        title="Ordonează"
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
            Apasă pe obiecte, în ordine, de la mic la mare
          </button>
          <div className="order-area" style={{ background: theme.bg }}>
            {items.map((it) => (
              <button
                key={it.rank}
                className={'order-item' + (it.rank < next ? ' done' : '') + (wrongRank === it.rank ? ' shake' : '')}
                style={{ left: `${it.x}%`, top: `${it.y}%` }}
                onClick={() => tap(it.rank)}
                aria-label="obiect"
              >
                <span className="emoji" style={{ fontSize: `${it.size}px` }}>
                  {theme.emoji}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      <Reward show={reward} />
    </div>
  )
}
