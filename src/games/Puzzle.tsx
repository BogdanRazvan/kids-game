import { useEffect, useRef, useState, PointerEvent as RPointerEvent } from 'react'
import { TopBar } from '../components/TopBar'
import { DoneScreen } from '../components/DoneScreen'
import { Reward } from '../components/Reward'
import { GameProps, ROUNDS_PER_GAME, sample, shuffle } from '../lib/game'
import { speak, successChime, wrongBuzz } from '../lib/audio'
import { PHOTOS } from './photoScenes'

// The picture stays whole. Each tray piece is an exact rectangular crop of it;
// the child searches the picture for where that crop belongs and drops it there.
const INTRO = 'Găsește locul potrivit al fiecărei imagini'
const LEVELS = [3, 4, 5] // pieces per level
const COLS = 3
const ROWS = 3
const CELLS = Array.from({ length: COLS * ROWS }, (_, i) => i)

const colOf = (c: number) => c % COLS
const rowOf = (c: number) => Math.floor(c / COLS)
// Background position (%) that shows just this cell when background-size is 300%.
const bgPos = (c: number) => `${colOf(c) * 50}% ${rowOf(c) * 50}%`

function cellAt(fx: number, fy: number) {
  const col = Math.min(COLS - 1, Math.max(0, Math.floor(fx * COLS)))
  const row = Math.min(ROWS - 1, Math.max(0, Math.floor(fy * ROWS)))
  return row * COLS + col
}

function Piece({ img, cell }: { img: string; cell: number }) {
  return (
    <div
      className="piece-img"
      style={{ backgroundImage: `url(${img})`, backgroundPosition: bgPos(cell) }}
    />
  )
}

export function Puzzle({ onBack }: GameProps) {
  const [level, setLevel] = useState(0)
  const [index, setIndex] = useState(0)
  // A shuffled deck dealt one photo per round across the whole session (levels
  // included); it only reshuffles once every photo has been used.
  const [deck, setDeck] = useState(() => ({ order: shuffle(PHOTOS), pos: 0 }))
  const img = deck.order[deck.pos]
  const [pieces, setPieces] = useState<number[]>(() => sample(CELLS, LEVELS[0]))
  const [placed, setPlaced] = useState<Set<number>>(new Set())
  const [dragCell, setDragCell] = useState<number | null>(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const [reward, setReward] = useState(false)
  const [wrongCell, setWrongCell] = useState<number | null>(null)
  const bigRef = useRef<HTMLDivElement>(null)
  const done = index >= ROUNDS_PER_GAME

  useEffect(() => {
    if (!done && index === 0) speak(INTRO)
  }, [pieces, done])

  // Deal the next photo; reshuffle only when the deck runs out (avoiding an
  // immediate repeat of the photo that was just shown).
  function dealNext() {
    setDeck(({ order, pos }) => {
      if (pos + 1 < order.length) return { order, pos: pos + 1 }
      let next = shuffle(PHOTOS)
      if (next[0] === order[pos]) next = [...next.slice(1), next[0]]
      return { order: next, pos: 0 }
    })
  }

  function newRound(l: number) {
    setPieces(sample(CELLS, LEVELS[l]))
    setPlaced(new Set())
    setDragCell(null)
  }

  function place(cell: number) {
    setPlaced((prev) => {
      const np = new Set(prev)
      np.add(cell)
      successChime()
      if (np.size === pieces.length) {
        setReward(true)
        setTimeout(() => {
          setReward(false)
          setIndex((n) => n + 1)
          dealNext()
          newRound(level)
        }, 1200)
      }
      return np
    })
  }

  useEffect(() => {
    if (dragCell === null) return
    const active = dragCell
    function move(e: globalThis.PointerEvent) {
      setDragPos({ x: e.clientX, y: e.clientY })
    }
    function up(e: globalThis.PointerEvent) {
      const rect = bigRef.current?.getBoundingClientRect()
      let ok = false
      if (rect) {
        const fx = (e.clientX - rect.left) / rect.width
        const fy = (e.clientY - rect.top) / rect.height
        if (fx >= 0 && fx < 1 && fy >= 0 && fy < 1) ok = cellAt(fx, fy) === active
      }
      setDragCell(null)
      if (ok) place(active)
      else {
        wrongBuzz()
        setWrongCell(active)
        setTimeout(() => setWrongCell(null), 400)
      }
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [dragCell])

  function startDrag(cell: number, e: RPointerEvent<HTMLDivElement>) {
    if (reward || placed.has(cell)) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragPos({ x: e.clientX, y: e.clientY })
    setDragCell(cell)
  }

  function restart() {
    setIndex(0)
    setDeck({ order: shuffle(PHOTOS), pos: 0 })
    newRound(level)
  }
  function nextLevel() {
    const nl = Math.min(level + 1, LEVELS.length - 1)
    setLevel(nl)
    setIndex(0)
    dealNext()
    newRound(nl)
  }

  const inTray = pieces.filter((c) => !placed.has(c))

  return (
    <div className="game" style={{ ['--n' as string]: pieces.length } as React.CSSProperties}>
      <TopBar
        title="Puzzle"
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
            Găsește locul potrivit al fiecărei imagini
          </button>
          <div className="diff-progress" aria-label={`${placed.size} din ${pieces.length}`}>
            {pieces.map((_, i) => (
              <span key={i} className={'diff-dot' + (i < placed.size ? ' on' : '')} />
            ))}
          </div>
          <div className="puzzle-area">
            <div className="puzzle-tray">
              {inTray.map((c) => (
                <div
                  key={c}
                  className={'puzzle-piece' + (wrongCell === c ? ' shake' : '') + (dragCell === c ? ' dragging' : '')}
                  onPointerDown={(e) => startDrag(c, e)}
                >
                  <Piece img={img} cell={c} />
                </div>
              ))}
            </div>
            <div className="scene" ref={bigRef}>
              <div className="scene-img" style={{ backgroundImage: `url(${img})` }} />
            </div>
          </div>
        </div>
      )}
      {dragCell !== null && (
        <div className="drag-ghost" style={{ left: dragPos.x, top: dragPos.y }}>
          <Piece img={img} cell={dragCell} />
        </div>
      )}
      <Reward show={reward} />
    </div>
  )
}
