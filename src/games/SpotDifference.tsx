import { useEffect, useState, MouseEvent } from 'react'
import { TopBar } from '../components/TopBar'
import { DoneScreen } from '../components/DoneScreen'
import { Reward } from '../components/Reward'
import { GameProps, pick, ROUNDS_PER_GAME, sample } from '../lib/game'
import { speak, successChime, wrongBuzz } from '../lib/audio'
import { COLORS, draw, SCENE, SceneBg, SceneDefs, VH, VW } from './sceneArt'

const INTRO = 'Găsește diferențele'
const LEVELS = [2, 3, 4] // differences per level
const TOL_X = 9
const TOL_Y = 11

type Diff = { id: string; recolor?: string } // recolor set => changed colour; else removed
type Board = { diffs: Diff[] }

function makeBoard(n: number): Board {
  const chosen = sample(SCENE, n)
  const diffs = chosen.map((it) => {
    const canRecolor = ['tree', 'flower', 'balloon', 'butterfly', 'bird', 'apple'].includes(it.kind)
    if (canRecolor && Math.random() < 0.5) {
      let c = pick(COLORS)
      while (c === it.color) c = pick(COLORS)
      return { id: it.id, recolor: c }
    }
    return { id: it.id }
  })
  return { diffs }
}

export function SpotDifference({ onBack }: GameProps) {
  const [level, setLevel] = useState(0)
  const [index, setIndex] = useState(0)
  const [board, setBoard] = useState<Board>(() => makeBoard(LEVELS[0]))
  const [found, setFound] = useState<Set<string>>(new Set())
  const [reward, setReward] = useState(false)
  const [wrong, setWrong] = useState(false)
  const done = index >= ROUNDS_PER_GAME

  useEffect(() => {
    if (!done && index === 0) speak(INTRO)
  }, [board, done])

  function newBoard(l: number) {
    setBoard(makeBoard(LEVELS[l]))
    setFound(new Set())
  }

  function clickScene(e: MouseEvent<HTMLDivElement>) {
    if (reward) return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * VW
    const py = ((e.clientY - rect.top) / rect.height) * VH
    const hit = board.diffs.find((d) => {
      if (found.has(d.id)) return false
      const it = SCENE.find((s) => s.id === d.id)!
      return Math.abs(px - it.x) < TOL_X && Math.abs(py - it.y) < TOL_Y
    })
    if (hit) {
      const nf = new Set(found)
      nf.add(hit.id)
      setFound(nf)
      successChime()
      if (nf.size === board.diffs.length) {
        setReward(true)
        setTimeout(() => {
          setReward(false)
          setIndex((n) => n + 1)
          newBoard(level)
        }, 1200)
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
    newBoard(level)
  }
  function nextLevel() {
    const nl = Math.min(level + 1, LEVELS.length - 1)
    setLevel(nl)
    setIndex(0)
    newBoard(nl)
  }

  function scene(side: 'a' | 'b') {
    const diffById = new Map(board.diffs.map((d) => [d.id, d]))
    return (
      <div className={'scene' + (wrong ? ' wrong' : '')} onClick={clickScene}>
        <svg viewBox={`0 0 ${VW} ${VH}`} className="scene-svg">
          <SceneBg />
          {SCENE.map((it) => {
            const d = diffById.get(it.id)
            if (side === 'b' && d && !d.recolor) return null
            const color = side === 'b' && d?.recolor ? d.recolor : it.color
            return (
              <g key={it.id} transform={`translate(${it.x} ${it.y}) scale(${it.scale ?? 1})`}>
                {draw(it.kind, color)}
              </g>
            )
          })}
          {[...found].map((id) => {
            const it = SCENE.find((s) => s.id === id)!
            return <circle key={id} cx={it.x} cy={it.y} r={11} className="scene-ring" />
          })}
        </svg>
      </div>
    )
  }

  return (
    <div className="game">
      <TopBar
        title="Diferențe"
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
            Găsește diferențele
          </button>
          <div className="diff-progress" aria-label={`${found.size} din ${board.diffs.length}`}>
            {board.diffs.map((_, i) => (
              <span key={i} className={'diff-dot' + (i < found.size ? ' on' : '')} />
            ))}
          </div>
          <div className="spot-pair">
            {scene('a')}
            {scene('b')}
          </div>
        </div>
      )}
      <Reward show={reward} />
    </div>
  )
}
