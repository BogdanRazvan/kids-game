import { useEffect, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { DoneScreen } from '../components/DoneScreen'
import { Reward } from '../components/Reward'
import { GameProps, randInt, ROUNDS_PER_GAME } from '../lib/game'
import { flipTick, speak, successChime } from '../lib/audio'

// Tap a neighbouring open cell to walk the mouse through the maze to the cheese.
const LEVELS = [4, 5, 6] // grid size
const INTRO = 'Ajută șoricelul să găsească brânza'

type Cell = { n: boolean; e: boolean; s: boolean; w: boolean }

// Perfect maze via iterative recursive-backtracker.
function genMaze(size: number): Cell[][] {
  const g: Cell[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ n: true, e: true, s: true, w: true }))
  )
  const seen = Array.from({ length: size }, () => Array<boolean>(size).fill(false))
  const stack: [number, number][] = [[0, 0]]
  seen[0][0] = true
  while (stack.length) {
    const [x, y] = stack[stack.length - 1]
    const opts: [number, number, keyof Cell][] = []
    if (y > 0 && !seen[y - 1][x]) opts.push([x, y - 1, 'n'])
    if (x < size - 1 && !seen[y][x + 1]) opts.push([x + 1, y, 'e'])
    if (y < size - 1 && !seen[y + 1][x]) opts.push([x, y + 1, 's'])
    if (x > 0 && !seen[y][x - 1]) opts.push([x - 1, y, 'w'])
    if (!opts.length) {
      stack.pop()
      continue
    }
    const [nx, ny, dir] = opts[randInt(0, opts.length - 1)]
    const opp = { n: 's', e: 'w', s: 'n', w: 'e' } as const
    g[y][x][dir] = false
    g[ny][nx][opp[dir]] = false
    seen[ny][nx] = true
    stack.push([nx, ny])
  }
  return g
}

export function Maze({ onBack }: GameProps) {
  const [level, setLevel] = useState(0)
  const [index, setIndex] = useState(0)
  const [size, setSize] = useState(LEVELS[0])
  const [maze, setMaze] = useState<Cell[][]>(() => genMaze(LEVELS[0]))
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [reward, setReward] = useState(false)
  const done = index >= ROUNDS_PER_GAME
  const atGoal = (p: { x: number; y: number }) => p.x === size - 1 && p.y === size - 1

  function newRound(l: number) {
    setSize(LEVELS[l])
    setMaze(genMaze(LEVELS[l]))
    setPos({ x: 0, y: 0 })
  }

  function open(from: { x: number; y: number }, x: number, y: number): boolean {
    const dx = x - from.x
    const dy = y - from.y
    if (Math.abs(dx) + Math.abs(dy) !== 1) return false
    const c = maze[from.y][from.x]
    return dx === 1 ? !c.e : dx === -1 ? !c.w : dy === 1 ? !c.s : !c.n
  }

  function tap(x: number, y: number) {
    if (reward || !open(pos, x, y)) return
    flipTick()
    setPos({ x, y })
    if (atGoal({ x, y })) {
      successChime()
      speak('Bravo!')
      setReward(true)
      setTimeout(() => {
        setReward(false)
        setIndex((n) => n + 1)
        newRound(level)
      }, 1200)
    }
  }

  // Speak the instruction when the game opens.
  useEffect(() => {
    speak(INTRO)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Arrow keys / WASD walk the mouse when the neighbour cell is open.
  useEffect(() => {
    if (done) return
    const onKey = (e: KeyboardEvent) => {
      const move: Record<string, [number, number]> = {
        ArrowUp: [0, -1], w: [0, -1], W: [0, -1],
        ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
        ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0],
        ArrowRight: [1, 0], d: [1, 0], D: [1, 0],
      }
      const d = move[e.key]
      if (!d) return
      e.preventDefault()
      tap(pos.x + d[0], pos.y + d[1])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pos, maze, size, reward, done, level])

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

  // Internal walls, drawn once each as SVG line segments (in cell units).
  const walls: [number, number, number, number][] = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const c = maze[y][x]
      if (x < size - 1 && c.e) walls.push([x + 1, y, x + 1, y + 1])
      if (y < size - 1 && c.s) walls.push([x, y + 1, x + 1, y + 1])
    }
  }

  return (
    <div className="game">
      <TopBar
        title="Labirint"
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
            Ajută șoricelul să găsească brânza
          </button>
          <div className="maze" style={{ ['--size' as string]: size } as React.CSSProperties}>
            <div className="maze-grid">
              {maze.map((row, y) =>
                row.map((_, x) => {
                  const isPos = pos.x === x && pos.y === y
                  const isGoal = x === size - 1 && y === size - 1
                  const canGo = open(pos, x, y)
                  return (
                    <button
                      key={`${x}-${y}`}
                      className={'maze-cell' + (canGo ? ' go' : '')}
                      tabIndex={-1}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => tap(x, y)}
                      aria-label="celulă"
                    >
                      {isPos ? '🐭' : isGoal ? '🧀' : canGo ? <span className="maze-dot" /> : ''}
                    </button>
                  )
                })
              )}
            </div>
            <svg
              className="maze-walls"
              viewBox={`0 0 ${size} ${size}`}
              aria-hidden="true"
            >
              {walls.map(([x1, y1, x2, y2], i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
              ))}
            </svg>
          </div>
        </div>
      )}
      <Reward show={reward} />
    </div>
  )
}
