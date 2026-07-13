import { createElement, useEffect, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { GameProps } from '../lib/game'
import { speak } from '../lib/audio'
import { COLORS } from '../data/content'

// Tap a region of the outline to fill it with the selected colour; pick the
// eraser to clear a region back to white. No score, no fail — just calm
// fine-motor play.
type Region = { id: string; t: 'rect' | 'circle' | 'ellipse' | 'polygon'; p: Record<string, number | string> }
type Template = { name: string; regions: Region[] }

// Build the points for a star / sun-burst polygon (alternating outer & inner radii).
function burst(cx: number, cy: number, spikes: number, outer: number, inner: number): string {
  const pts: string[] = []
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (Math.PI * i) / spikes - Math.PI / 2
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(' ')
}

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
  {
    name: 'soare',
    regions: [
      { id: 'sky', t: 'rect', p: { x: 0, y: 0, width: 100, height: 100 } },
      { id: 'rays', t: 'polygon', p: { points: burst(50, 50, 12, 47, 31) } },
      { id: 'sun', t: 'circle', p: { cx: 50, cy: 50, r: 26 } },
      { id: 'cheekL', t: 'circle', p: { cx: 39, cy: 55, r: 4 } },
      { id: 'cheekR', t: 'circle', p: { cx: 61, cy: 55, r: 4 } },
    ],
  },
  {
    name: 'stea',
    regions: [
      { id: 'sky', t: 'rect', p: { x: 0, y: 0, width: 100, height: 100 } },
      { id: 'star', t: 'polygon', p: { points: burst(50, 50, 5, 42, 18) } },
    ],
  },
  {
    name: 'copac',
    regions: [
      { id: 'sky', t: 'rect', p: { x: 0, y: 0, width: 100, height: 100 } },
      { id: 'grass', t: 'rect', p: { x: 0, y: 82, width: 100, height: 18 } },
      { id: 'trunk', t: 'rect', p: { x: 45, y: 54, width: 10, height: 30, rx: 2 } },
      { id: 'leafL', t: 'circle', p: { cx: 34, cy: 50, r: 15 } },
      { id: 'leafR', t: 'circle', p: { cx: 66, cy: 50, r: 15 } },
      { id: 'leafTop', t: 'circle', p: { cx: 50, cy: 38, r: 22 } },
    ],
  },
  {
    name: 'mașină',
    regions: [
      { id: 'sky', t: 'rect', p: { x: 0, y: 0, width: 100, height: 100 } },
      { id: 'road', t: 'rect', p: { x: 0, y: 74, width: 100, height: 26 } },
      { id: 'roof', t: 'polygon', p: { points: '32,50 44,36 62,36 72,50' } },
      { id: 'body', t: 'rect', p: { x: 14, y: 50, width: 72, height: 20, rx: 6 } },
      { id: 'window', t: 'rect', p: { x: 46, y: 38, width: 14, height: 11, rx: 1 } },
      { id: 'wheelL', t: 'circle', p: { cx: 34, cy: 70, r: 9 } },
      { id: 'wheelR', t: 'circle', p: { cx: 66, cy: 70, r: 9 } },
      { id: 'hubL', t: 'circle', p: { cx: 34, cy: 70, r: 3.5 } },
      { id: 'hubR', t: 'circle', p: { cx: 66, cy: 70, r: 3.5 } },
    ],
  },
  {
    name: 'barcă',
    regions: [
      { id: 'sky', t: 'rect', p: { x: 0, y: 0, width: 100, height: 64 } },
      { id: 'water', t: 'rect', p: { x: 0, y: 64, width: 100, height: 36 } },
      { id: 'hull', t: 'polygon', p: { points: '24,64 76,64 68,82 32,82' } },
      { id: 'mast', t: 'rect', p: { x: 48, y: 26, width: 4, height: 38 } },
      { id: 'sail', t: 'polygon', p: { points: '52,28 52,62 80,60' } },
      { id: 'flag', t: 'polygon', p: { points: '48,26 48,35 39,30' } },
    ],
  },
  {
    name: 'rachetă',
    regions: [
      { id: 'sky', t: 'rect', p: { x: 0, y: 0, width: 100, height: 100 } },
      { id: 'flame', t: 'polygon', p: { points: '42,78 58,78 50,96' } },
      { id: 'finL', t: 'polygon', p: { points: '38,62 26,84 38,80' } },
      { id: 'finR', t: 'polygon', p: { points: '62,62 74,84 62,80' } },
      { id: 'body', t: 'rect', p: { x: 38, y: 40, width: 24, height: 40, rx: 12 } },
      { id: 'nose', t: 'polygon', p: { points: '38,44 62,44 50,16' } },
      { id: 'window', t: 'circle', p: { cx: 50, cy: 52, r: 8 } },
    ],
  },
  {
    name: 'balon',
    regions: [
      { id: 'sky', t: 'rect', p: { x: 0, y: 0, width: 100, height: 100 } },
      { id: 'balloon', t: 'ellipse', p: { cx: 50, cy: 38, rx: 26, ry: 30 } },
      { id: 'stripeL', t: 'ellipse', p: { cx: 40, cy: 38, rx: 6, ry: 29 } },
      { id: 'stripeR', t: 'ellipse', p: { cx: 60, cy: 38, rx: 6, ry: 29 } },
      { id: 'ropeL', t: 'rect', p: { x: 40, y: 64, width: 2, height: 14 } },
      { id: 'ropeR', t: 'rect', p: { x: 58, y: 64, width: 2, height: 14 } },
      { id: 'basket', t: 'rect', p: { x: 42, y: 76, width: 16, height: 12, rx: 2 } },
    ],
  },
  {
    name: 'ciupercă',
    regions: [
      { id: 'sky', t: 'rect', p: { x: 0, y: 0, width: 100, height: 100 } },
      { id: 'grass', t: 'rect', p: { x: 0, y: 82, width: 100, height: 18 } },
      { id: 'stem', t: 'rect', p: { x: 42, y: 50, width: 16, height: 36, rx: 6 } },
      { id: 'cap', t: 'ellipse', p: { cx: 50, cy: 46, rx: 30, ry: 22 } },
      { id: 'spot1', t: 'circle', p: { cx: 39, cy: 44, r: 5 } },
      { id: 'spot2', t: 'circle', p: { cx: 59, cy: 42, r: 4 } },
      { id: 'spot3', t: 'circle', p: { cx: 50, cy: 52, r: 4 } },
    ],
  },
  {
    name: 'înghețată',
    regions: [
      { id: 'sky', t: 'rect', p: { x: 0, y: 0, width: 100, height: 100 } },
      { id: 'cone', t: 'polygon', p: { points: '40,58 60,58 50,92' } },
      { id: 'scoop1', t: 'circle', p: { cx: 50, cy: 54, r: 14 } },
      { id: 'scoop2', t: 'circle', p: { cx: 42, cy: 40, r: 11 } },
      { id: 'scoop3', t: 'circle', p: { cx: 58, cy: 40, r: 11 } },
      { id: 'cherry', t: 'circle', p: { cx: 50, cy: 27, r: 5 } },
    ],
  },
  {
    name: 'pisică',
    regions: [
      { id: 'sky', t: 'rect', p: { x: 0, y: 0, width: 100, height: 100 } },
      { id: 'earL', t: 'polygon', p: { points: '28,30 42,22 42,46' } },
      { id: 'earR', t: 'polygon', p: { points: '72,30 58,22 58,46' } },
      { id: 'head', t: 'circle', p: { cx: 50, cy: 54, r: 28 } },
      { id: 'eyeL', t: 'circle', p: { cx: 40, cy: 50, r: 5 } },
      { id: 'eyeR', t: 'circle', p: { cx: 60, cy: 50, r: 5 } },
      { id: 'nose', t: 'polygon', p: { points: '46,60 54,60 50,65' } },
    ],
  },
]

export function Coloring({ onBack }: GameProps) {
  const [tpl, setTpl] = useState(0)
  const [color, setColor] = useState(COLORS[0])
  const [erasing, setErasing] = useState(false)
  const [fills, setFills] = useState<Record<string, string>>({})

  const template = TEMPLATES[tpl]

  useEffect(() => {
    speak('Colorează')
  }, [])

  function fill(id: string) {
    setFills((f) => {
      if (erasing) {
        const { [id]: _drop, ...rest } = f
        return rest
      }
      return { ...f, [id]: color.hex }
    })
  }
  function pickColor(c: (typeof COLORS)[number]) {
    setColor(c)
    setErasing(false)
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
              className={'paint-swatch' + (!erasing && c.name === color.name ? ' sel' : '')}
              style={{ background: c.hex }}
              onClick={() => pickColor(c)}
              aria-label={c.name}
            />
          ))}
          <button
            className={'paint-swatch eraser-swatch' + (erasing ? ' sel' : '')}
            onClick={() => setErasing(true)}
            aria-label="radieră"
          >
            🧽
          </button>
        </div>
        <div className="tool-row">
          <button className="tool-btn" onClick={() => setFills({})}>
            🗑️ Golește
          </button>
          <button className="tool-btn" onClick={nextPicture}>
            🔄 Altă imagine
          </button>
        </div>
      </div>
    </div>
  )
}
