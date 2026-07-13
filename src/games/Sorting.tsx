import { useEffect, useRef, useState, PointerEvent as RPointerEvent } from 'react'
import { TopBar } from '../components/TopBar'
import { DoneScreen } from '../components/DoneScreen'
import { Reward } from '../components/Reward'
import { CATEGORIES } from '../data/content'
import { GameProps, pick, ROUNDS_PER_GAME, sample, shuffle } from '../lib/game'
import { speak, successChime, wrongBuzz } from '../lib/audio'

// Two category bins; drag each object into the one it belongs to.
const LEVELS = [4, 6, 8] // objects per round
const INTRO = 'Pune fiecare obiect în căsuța potrivită'

type Item = { id: number; emoji: string; bin: 0 | 1 }
type Round = { items: Item[]; labels: [string, string] }

function makeRound(n: number, a: string[], b: string[]): Round {
  const half = Math.ceil(n / 2)
  const itemsA = sample(a, half).map((emoji, i) => ({ id: i, emoji, bin: 0 as const }))
  const itemsB = sample(b, n - half).map((emoji, i) => ({ id: half + i, emoji, bin: 1 as const }))
  return { items: shuffle([...itemsA, ...itemsB]), labels: [pick(a), pick(b)] }
}

export function Sorting({ onBack }: GameProps) {
  const [level, setLevel] = useState(0)
  const [index, setIndex] = useState(0)
  const usedPairs = useRef<Set<string>>(new Set())
  const [round, setRound] = useState<Round>(() => nextRound(LEVELS[0]))
  const [sorted, setSorted] = useState<Set<number>>(new Set())
  const [dragId, setDragId] = useState<number | null>(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const [reward, setReward] = useState(false)
  const [wrongId, setWrongId] = useState<number | null>(null)
  const binRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]
  const done = index >= ROUNDS_PER_GAME

  useEffect(() => {
    if (!done && index === 0) speak(INTRO)
  }, [round, done])

  // Pick a category pair not used yet this run (resets once pairs run out).
  function nextRound(n: number): Round {
    let i = 0, j = 1, key = ''
    for (let t = 0; t < 25; t++) {
      ;[i, j] = sample(CATEGORIES.map((_, k) => k), 2)
      key = i < j ? `${i}-${j}` : `${j}-${i}`
      if (!usedPairs.current.has(key)) break
    }
    if (usedPairs.current.has(key)) usedPairs.current.clear()
    usedPairs.current.add(key)
    return makeRound(n, CATEGORIES[i], CATEGORIES[j])
  }

  function newRound(l: number) {
    setRound(nextRound(LEVELS[l]))
    setSorted(new Set())
    setDragId(null)
  }

  function place(item: Item) {
    setSorted((prev) => {
      const ns = new Set(prev)
      ns.add(item.id)
      successChime()
      if (ns.size === round.items.length) {
        setReward(true)
        setTimeout(() => {
          setReward(false)
          setIndex((n) => n + 1)
          newRound(level)
        }, 1200)
      }
      return ns
    })
  }

  useEffect(() => {
    if (dragId === null) return
    const item = round.items.find((it) => it.id === dragId)!
    function move(e: globalThis.PointerEvent) {
      setDragPos({ x: e.clientX, y: e.clientY })
    }
    function inBin(ref: React.RefObject<HTMLDivElement>, e: globalThis.PointerEvent) {
      const r = ref.current?.getBoundingClientRect()
      return !!r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
    }
    function up(e: globalThis.PointerEvent) {
      const target = inBin(binRefs[0], e) ? 0 : inBin(binRefs[1], e) ? 1 : -1
      setDragId(null)
      if (target === item.bin) place(item)
      else if (target !== -1) {
        wrongBuzz()
        setWrongId(item.id)
        setTimeout(() => setWrongId(null), 400)
      }
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [dragId])

  function startDrag(id: number, e: RPointerEvent<HTMLDivElement>) {
    if (reward || sorted.has(id)) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragPos({ x: e.clientX, y: e.clientY })
    setDragId(id)
  }

  function restart() {
    usedPairs.current.clear()
    setIndex(0)
    newRound(level)
  }
  function nextLevel() {
    const nl = Math.min(level + 1, LEVELS.length - 1)
    setLevel(nl)
    setIndex(0)
    newRound(nl)
  }

  const inTray = round.items.filter((it) => !sorted.has(it.id))
  const dragItem = dragId !== null ? round.items.find((it) => it.id === dragId)! : null

  return (
    <div className="game">
      <TopBar
        title="Sortare"
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
            Pune fiecare obiect în căsuța potrivită
          </button>
          <div className="sort-bins">
            {[0, 1].map((b) => (
              <div key={b} className="sort-bin" ref={binRefs[b]}>
                <span className="sort-bin-label emoji">{round.labels[b]}</span>
                <div className="sort-bin-items">
                  {round.items
                    .filter((it) => sorted.has(it.id) && it.bin === b)
                    .map((it) => (
                      <span key={it.id} className="emoji small">
                        {it.emoji}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
          <div className="sort-tray">
            {inTray.map((it) => (
              <div
                key={it.id}
                className={'sort-item' + (wrongId === it.id ? ' shake' : '') + (dragId === it.id ? ' dragging' : '')}
                onPointerDown={(e) => startDrag(it.id, e)}
              >
                <span className="emoji">{it.emoji}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {dragItem && (
        <div className="sort-ghost" style={{ left: dragPos.x, top: dragPos.y }}>
          <span className="emoji">{dragItem.emoji}</span>
        </div>
      )}
      <Reward show={reward} />
    </div>
  )
}
