import { ReactNode } from 'react'

// Shared flat-vector scene used by the "spot the difference" and "puzzle" games.
// Objects are drawn around their own (0,0); positions live in a 100×125 viewBox.
export const VW = 100
export const VH = 125
export const COLORS = ['#e63946', '#f3a712', '#f7d716', '#2a9d54', '#1d7bd6', '#8e44ad', '#e8348c']

function Cloud() {
  return (
    <g fill="#ffffff">
      <ellipse cx={0} cy={1} rx={11} ry={4.5} />
      <ellipse cx={-6} cy={-1} rx={5} ry={4.5} />
      <ellipse cx={5} cy={-1.5} rx={6} ry={5} />
    </g>
  )
}
function Tree(c: string) {
  return (
    <g>
      <rect x={-2.2} y={2} width={4.4} height={14} rx={2} fill="#8a5a2b" />
      <circle cx={0} cy={-6} r={9} fill={c} />
      <circle cx={-7} cy={-1} r={6.5} fill={c} />
      <circle cx={7} cy={-1} r={6.5} fill={c} />
      <circle cx={0} cy={0} r={7.5} fill={c} />
    </g>
  )
}
function Bush(c: string) {
  return (
    <g fill={c}>
      <circle cx={-5.5} cy={1} r={5.5} />
      <circle cx={5.5} cy={1} r={5.5} />
      <circle cx={0} cy={-2.5} r={6.5} />
    </g>
  )
}
function Flower(c: string) {
  return (
    <g>
      <line x1={0} y1={0} x2={0} y2={9} stroke="#2f9e44" strokeWidth={1.6} />
      {[
        [0, -7.5],
        [-3.6, -4],
        [3.6, -4],
        [-2.2, -0.4],
        [2.2, -0.4],
      ].map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={2.5} fill={c} />
      ))}
      <circle cx={0} cy={-4} r={2.6} fill="#ffd43b" />
    </g>
  )
}
function Balloon(c: string) {
  return (
    <g>
      <line x1={0} y1={7} x2={0} y2={22} stroke="#adb5bd" strokeWidth={0.8} />
      <ellipse cx={0} cy={0} rx={5.5} ry={6.5} fill={c} />
      <path d="M-1.4 6 L1.4 6 L0 8.5 Z" fill={c} />
    </g>
  )
}
function Butterfly(c: string) {
  return (
    <g>
      <ellipse cx={-3.6} cy={-3} rx={3.6} ry={4.2} fill={c} />
      <ellipse cx={3.6} cy={-3} rx={3.6} ry={4.2} fill={c} />
      <ellipse cx={-3} cy={3} rx={3} ry={3.4} fill={c} />
      <ellipse cx={3} cy={3} rx={3} ry={3.4} fill={c} />
      <rect x={-0.7} y={-5.5} width={1.4} height={11} rx={0.7} fill="#3a2b1a" />
    </g>
  )
}
function Bird(c: string) {
  return (
    <g>
      <ellipse cx={0} cy={0} rx={6} ry={4.2} fill={c} />
      <circle cx={4.8} cy={-3} r={3.2} fill={c} />
      <path d="M7.4 -3 L11.5 -2 L7.4 -1 Z" fill="#f4a020" />
      <circle cx={5.4} cy={-3.6} r={0.9} fill="#222" />
      <path d="M-1 -0.5 q-4 -4 -7.5 -0.5 q4 2.5 7.5 0.5 Z" fill="#00000022" />
    </g>
  )
}
function Mushroom() {
  return (
    <g>
      <rect x={-2.6} y={-0.5} width={5.2} height={8.5} rx={2.4} fill="#f6ead0" />
      <path d="M-8.5 0 A8.5 6.5 0 0 1 8.5 0 Z" fill="#e63946" />
      <circle cx={-3.2} cy={-2.6} r={1.4} fill="#fff" />
      <circle cx={3} cy={-2.2} r={1.2} fill="#fff" />
      <circle cx={0.2} cy={-4.4} r={1.1} fill="#fff" />
    </g>
  )
}
function Apple(c: string) {
  return (
    <g>
      <circle cx={0} cy={0} r={4.8} fill={c} />
      <rect x={-0.5} y={-6.5} width={1} height={2.6} fill="#7a4b28" />
      <ellipse cx={2.6} cy={-5} rx={2.2} ry={1.2} fill="#40c057" />
    </g>
  )
}
function Sun(c: string) {
  return (
    <g>
      <circle cx={0} cy={0} r={13} fill="url(#sd-glow)" />
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x={-1.1} y={-13} width={2.2} height={4.5} rx={1.1} fill={c} transform={`rotate(${i * 45})`} />
      ))}
      <circle cx={0} cy={0} r={7.5} fill={c} />
    </g>
  )
}

export type Kind =
  | 'cloud' | 'tree' | 'bush' | 'flower' | 'balloon' | 'butterfly' | 'bird' | 'mushroom' | 'apple' | 'sun'
export type Inst = { id: string; kind: Kind; x: number; y: number; color: string; scale?: number }

export function draw(kind: Kind, color: string): ReactNode {
  switch (kind) {
    case 'cloud': return Cloud()
    case 'tree': return Tree(color)
    case 'bush': return Bush(color)
    case 'flower': return Flower(color)
    case 'balloon': return Balloon(color)
    case 'butterfly': return Butterfly(color)
    case 'bird': return Bird(color)
    case 'mushroom': return Mushroom()
    case 'apple': return Apple(color)
    case 'sun': return Sun(color)
  }
}

export const SCENE: Inst[] = [
  { id: 'sun', kind: 'sun', x: 15, y: 16, color: '#ffd43b' },
  { id: 'cloud1', kind: 'cloud', x: 44, y: 14, color: '#fff' },
  { id: 'cloud2', kind: 'cloud', x: 80, y: 22, color: '#fff', scale: 0.8 },
  { id: 'bird', kind: 'bird', x: 60, y: 34, color: '#4dabf7' },
  { id: 'tree1', kind: 'tree', x: 20, y: 66, color: '#5aa02c', scale: 1.15 },
  { id: 'apple', kind: 'apple', x: 20, y: 60, color: '#e63946' },
  { id: 'tree2', kind: 'tree', x: 82, y: 70, color: '#2f9e44', scale: 1.1 },
  { id: 'balloon', kind: 'balloon', x: 90, y: 52, color: '#e8348c' },
  { id: 'butterfly', kind: 'butterfly', x: 46, y: 74, color: '#f3a712' },
  { id: 'bush', kind: 'bush', x: 34, y: 96, color: '#69b83f' },
  { id: 'mushroom', kind: 'mushroom', x: 12, y: 104, color: '#e63946' },
  { id: 'flower1', kind: 'flower', x: 52, y: 108, color: '#e63946' },
  { id: 'flower2', kind: 'flower', x: 66, y: 110, color: '#f7d716' },
  { id: 'flower3', kind: 'flower', x: 88, y: 106, color: '#8e44ad' },
]

// Hidden defs providing the sky + sun gradients used by every scene svg.
export function SceneDefs() {
  return (
    <svg width={0} height={0} aria-hidden="true" style={{ position: 'absolute' }}>
      <defs>
        <linearGradient id="sd-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9e0ff" />
          <stop offset="1" stopColor="#e4f6ff" />
        </linearGradient>
        <radialGradient id="sd-glow">
          <stop offset="0.45" stopColor="#ffe38a" />
          <stop offset="1" stopColor="#ffe38a" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  )
}

// Sky + hills, drawn at the back of each scene svg.
export function SceneBg() {
  return (
    <>
      <rect x={0} y={0} width={VW} height={VH} fill="url(#sd-sky)" />
      <path d={`M0 82 Q28 70 55 80 T100 76 L100 ${VH} L0 ${VH} Z`} fill="#8fd06a" />
      <path d={`M0 98 Q40 86 100 96 L100 ${VH} L0 ${VH} Z`} fill="#5aa84f" />
    </>
  )
}
