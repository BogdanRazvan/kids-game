import { useEffect, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { DoneScreen } from '../components/DoneScreen'
import { MEMORY_EMOJIS } from '../data/content'
import { GameProps, sample, shuffle } from '../lib/game'
import { flipTick, speak, successChime, wrongBuzz } from '../lib/audio'

type Card = { id: number; emoji: string }
// Pairs to find at each level — more pairs = harder.
const PAIRS_PER_LEVEL = [3, 4, 5, 6]
const INSTRUCTION = 'Găsește perechile'

function makeDeck(pairs: number): Card[] {
  const chosen = sample(MEMORY_EMOJIS, pairs)
  return shuffle(
    chosen.flatMap((emoji, i) => [
      { id: i * 2, emoji },
      { id: i * 2 + 1, emoji },
    ])
  )
}

export function Memory({ onBack }: GameProps) {
  const [level, setLevel] = useState(0)
  const pairs = PAIRS_PER_LEVEL[level]
  const [deck, setDeck] = useState<Card[]>(() => makeDeck(PAIRS_PER_LEVEL[0]))
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [lock, setLock] = useState(false)

  const done = matched.size === deck.length

  useEffect(() => {
    speak(INSTRUCTION)
  }, [])

  function flip(idx: number) {
    if (lock) return
    if (flipped.includes(idx) || matched.has(deck[idx].id)) return

    const next = [...flipped, idx]
    setFlipped(next)
    flipTick()

    if (next.length === 2) {
      setLock(true)
      const [a, b] = next
      if (deck[a].emoji === deck[b].emoji) {
        successChime()
        // No spoken praise on a match — the success chime is the reward.
        setTimeout(() => {
          setMatched((m) => new Set([...m, deck[a].id, deck[b].id]))
          setFlipped([])
          setLock(false)
        }, 650)
      } else {
        wrongBuzz()
        setTimeout(() => {
          setFlipped([])
          setLock(false)
        }, 900)
      }
    }
  }

  function reset(pairsForLevel: number) {
    setDeck(makeDeck(pairsForLevel))
    setFlipped([])
    setMatched(new Set())
    setLock(false)
  }

  // Replay the same level.
  function restart() {
    reset(pairs)
  }

  // Advance to the next (harder) level with more pairs.
  function nextLevel() {
    const nl = Math.min(level + 1, PAIRS_PER_LEVEL.length - 1)
    setLevel(nl)
    reset(PAIRS_PER_LEVEL[nl])
  }

  return (
    <div className="memory">
      <TopBar
        title="Memorie"
        onBack={onBack}
        total={pairs}
        index={matched.size / 2}
        onReplay={done ? undefined : () => speak(INSTRUCTION)}
        hideTitle
      />
      {done ? (
        <DoneScreen
          onAgain={restart}
          onHome={onBack}
          onContinue={level < PAIRS_PER_LEVEL.length - 1 ? nextLevel : undefined}
          level={level + 1}
          maxLevel={PAIRS_PER_LEVEL.length}
        />
      ) : (
        <div className="mem-body">
        <button className="prompt mem-prompt" onClick={() => speak(INSTRUCTION)}>
          <span className="prompt-icon" aria-hidden="true">
            🔊
          </span>
          {INSTRUCTION}
        </button>
        <div className="mem-grid">
          {deck.map((card, idx) => {
            const face = flipped.includes(idx) || matched.has(card.id)
            return (
              <button
                key={card.id}
                className={
                  'mem-card' +
                  (face ? ' face' : '') +
                  (matched.has(card.id) ? ' done' : '')
                }
                onClick={() => flip(idx)}
                aria-label={face ? card.emoji : 'carte ascunsă'}
              >
                {face ? (
                  <span className="emoji">{card.emoji}</span>
                ) : (
                  <span className="mem-q">❓</span>
                )}
              </button>
            )
          })}
        </div>
        </div>
      )}
    </div>
  )
}
