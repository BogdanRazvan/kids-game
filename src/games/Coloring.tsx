import { createElement, useEffect, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { GameProps } from '../lib/game'
import { speak } from '../lib/audio'
import { COLORS } from '../data/content'

// Tap a region of the outline to fill it with the selected colour. No score, no
// fail — just calm fine-motor play.
type Region = { id: string; t: 'rect' | 'circle' | 'ellipse' | 'polygon'; p: Record<string, number | string> }
type Template = { name: string; regions: Region[] }

const TEMPLATES: Template[] = [
  {
    name: 'floare',
    regions: [
      { id: 'sky', t: 'rect', p: { x: 0, y: 0, width: 100, height: 100 } },
      { id: 'stem', t: 'rect', p: { x: 47, y: 44, width: 6, height: 50, rx: 3 } },
      { id: 'leaf', t: 'ellipse', p: { cx: 64, cy: 72, rx: 13, ry: 6 } },
      { id: 'p0', t: 'circle', p: { cx: 50, cy: 23, r: 13 } },
      { id: 'p1', t: 'circle', p: { cx: 70, cy: 37, r: 13 } },
      { id: 'p2', t: 'circle', p: { cx: 62, cy: 61, r: 13 } },
      { id: 'p3', t: 'circle', p: { cx: 38, cy: 61, r: 13 } },
      { id: 'p4', t: 'circle', p: { cx: 30, cy: 37, r: 13 } },
      { id: 'center', t: 'circle', p: { cx: 50, cy: 44, r: 13 } },
    ],
  },
  {
    name: 'casă',
    regions: [
      { id: 'sky', t: 'rect', p: { x: 0, y: 0, width: 100, height: 100 } },
      { id: 'grass', t: 'rect', p: { x: 0, y: 82, width: 100, height: 18 } },
      { id: 'sun', t: 'circle', p: { cx: 82, cy: 18, r: 11 } },
      { id: 'roof', t: 'polygon', p: { points: '22,50 50,25 78,50' } },
      { id: 'wall', t: 'rect', p: { x: 30, y: 50, width: 40, height: 32 } },
      { id: 'window', t: 'rect', p: { x: 34, y: 56, width: 10, height: 10 } },
      { id: 'door', t: 'rect', p: { x: 45, y: 64, width: 12, height: 18, rx: 1 } },
    ],
  },
  {
    name: 'pește',
    regions: [
      { id: 'water', t: 'rect', p: { x: 0, y: 0, width: 100, height: 100 } },
      { id: 'tail', t: 'polygon', p: { points: '70,52 90,38 90,66' } },
      { id: 'body', t: 'ellipse', p: { cx: 46, cy: 52, rx: 27, ry: 17 } },
      { id: 'topfin', t: 'polygon', p: { points: '40,38 58,38 49,47' } },
      { id: 'botfin', t: 'polygon', p: { points: '40,66 58,66 49,57' } },
      { id: 'bub1', t: 'circle', p: { cx: 22, cy: 30, r: 4 } },
      { id: 'bub2', t: 'circle', p: { cx: 14, cy: 22, r: 3 } },
      { id: 'eye', t: 'circle', p: { cx: 33, cy: 48, r: 3.5 } },
    ],
  },
  {
    name: 'fluture',
    regions: [
      { id: 'sky', t: 'rect', p: { x: 0, y: 0, width: 100, height: 100 } },
      { id: 'wUL', t: 'ellipse', p: { cx: 35, cy: 40, rx: 15, ry: 17 } },
      { id: 'wUR', t: 'ellipse', p: { cx: 65, cy: 40, rx: 15, ry: 17 } },
      { id: 'wLL', t: 'ellipse', p: { cx: 38, cy: 64, rx: 12, ry: 13 } },
      { id: 'wLR', t: 'ellipse', p: { cx: 62, cy: 64, rx: 12, ry: 13 } },
      { id: 'body', t: 'ellipse', p: { cx: 50, cy: 52, rx: 4, ry: 20 } },
    ],
  },
]

export function Coloring({ onBack }: GameProps) {
  const [tpl, setTpl] = useState(0)
  const [color, setColor] = useState(COLORS[0])
  const [fills, setFills] = useState<Record<string, string>>({})

  const template = TEMPLATES[tpl]

  useEffect(() => {
    speak('Colorează')
  }, [])

  function fill(id: string) {
    setFills((f) => ({ ...f, [id]: color.hex }))
  }
  function nextPicture() {
    setTpl((t) => (t + 1) % TEMPLATES.length)
    setFills({})
  }

  return (
    <div className="game">
      <TopBar title="Colorează" onBack={onBack} total={0} index={0} hideTitle />
      <div className="game-body">
        <button className="prompt" onClick={() => speak('Colorează')}>
          <span className="prompt-icon" aria-hidden="true">🔊</span>
          Colorează
        </button>
        <div className="color-canvas">
          <svg viewBox="0 0 100 100">
            {template.regions.map((r) =>
              createElement(r.t, {
                key: r.id,
                ...r.p,
                fill: fills[r.id] ?? '#ffffff',
                stroke: '#3a3a3a',
                strokeWidth: 1.2,
                strokeLinejoin: 'round',
                onClick: () => fill(r.id),
                style: { cursor: 'pointer' },
              })
            )}
          </svg>
        </div>
        <div className="paint-palette">
          {COLORS.map((c) => (
            <button
              key={c.name}
              className={'paint-swatch' + (c.name === color.name ? ' sel' : '')}
              style={{ background: c.hex }}
              onClick={() => setColor(c)}
              aria-label={c.name}
            />
          ))}
        </div>
        <div className="tool-row">
          <button className="tool-btn" onClick={() => setFills({})}>
            🧽 Șterge
          </button>
          <button className="tool-btn" onClick={nextPicture}>
            🔄 Altă imagine
          </button>
        </div>
      </div>
    </div>
  )
}
