import { useEffect, useRef, useState, PointerEvent as RPointerEvent } from 'react'
import { TopBar } from '../components/TopBar'
import { DoneScreen } from '../components/DoneScreen'
import { Reward } from '../components/Reward'
import { GameProps, ROUNDS_PER_GAME, sample } from '../lib/game'
import { speak, successChime, wrongBuzz } from '../lib/audio'
import { draw, SCENE, SceneBg, SceneDefs, VH, VW } from './sceneArt'

// The picture stays whole. Each tray piece is an exact rectangular crop of it;
// the child searches the picture for where that crop belongs and drops it there.
const INTRO = 'Găsește locul potrivit al fiecărei imagini'
const LEVELS = [3, 4, 5] // pieces per level
const COLS = 3
const ROWS = 3
const CW = VW / COLS
const CH = VH / ROWS

const colOf = (c: number) => c % COLS
const rowOf = (c: number) => Math.floor(c / COLS)
const cellOf = (x: number, y: number) =>
  Math.min(ROWS - 1, Math.floor(y / CH)) * COLS + Math.min(COLS - 1, Math.floor(x / CW))
// Only cut cells that contain something recognisable (not empty sky).
const ELIGIBLE = [...new Set(SCENE.map((s) => cellOf(s.x, s.y)))]

function SceneObjects() {
  return (
    <>
      <SceneBg />
      {SCENE.map((it) => (
        <g key={it.id} transform={`translate(${it.x} ${it.y}) scale(${it.scale ?? 1})`}>
          {draw(it.kind, it.color)}
        </g>
      ))}
    </>
  )
}

// A piece = the whole scene cropped (via viewBox) to one cell.
function Piece({ cell }: { cell: number }) {
  return (
    <svg viewBox={`${colOf(cell) * CW} ${rowOf(cell) * CH} ${CW} ${CH}`} className="piece-svg">
      <SceneObjects />
    </svg>
  )
}

export function Puzzle({ onBack }: GameProps) {
  const [level, setLevel] = useState(0)
  const [index, setIndex] = useState(0)
  const [pieces, setPieces] = useState<number[]>(() => sample(ELIGIBLE, LEVELS[0]))
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

  function newRound(l: number) {
    setPieces(sample(ELIGIBLE, LEVELS[l]))
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
        const vx = ((e.clientX - rect.left) / rect.width) * VW
        const vy = ((e.clientY - rect.top) / rect.height) * VH
        if (vx >= 0 && vx < VW && vy >= 0 && vy < VH) ok = cellOf(vx, vy) === active
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
    newRound(level)
  }
  function nextLevel() {
    const nl = Math.min(level + 1, LEVELS.length - 1)
    setLevel(nl)
    setIndex(0)
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
      <SceneDefs />
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
                  <Piece cell={c} />
                </div>
              ))}
            </div>
            <div className="scene" ref={bigRef}>
              <svg viewBox={`0 0 ${VW} ${VH}`} className="scene-svg">
                <SceneObjects />
              </svg>
            </div>
          </div>
        </div>
      )}
      {dragCell !== null && (
        <div className="drag-ghost" style={{ left: dragPos.x, top: dragPos.y }}>
          <Piece cell={dragCell} />
        </div>
      )}
      <Reward show={reward} />
    </div>
  )
}
