import { useEffect, useRef, useState, PointerEvent as RPointerEvent } from 'react'
import { TopBar } from '../components/TopBar'
import { GameProps } from '../lib/game'
import { speak } from '../lib/audio'
import { COLORS } from '../data/content'

// Free finger-paint canvas: drag to draw, pick a colour and brush size, erase, or
// clear the whole thing. A few extra bright hues live only here (they're never
// spoken, so no audio clips needed).
const BRUSHES = [8, 18, 32]
const EXTRA = [
  { name: 'bleu', hex: '#4dabf7' },
  { name: 'lime', hex: '#82c91e' },
  { name: 'indigo', hex: '#4263eb' },
  { name: 'fucsia', hex: '#e64980' },
  { name: 'corai', hex: '#ff8787' },
]
const PALETTE = [...COLORS, ...EXTRA]
const ERASE = '#ffffff' // the canvas background

export function Paint({ onBack }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const [color, setColor] = useState(PALETTE[0].hex)
  const [brush, setBrush] = useState(BRUSHES[1])
  const [erasing, setErasing] = useState(false)
  const colorRef = useRef(color)
  const brushRef = useRef(brush)
  const erasingRef = useRef(erasing)
  colorRef.current = color
  brushRef.current = brush
  erasingRef.current = erasing

  // Size the backing store to the element (×dpr) so strokes stay crisp.
  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const resize = () => {
      const rect = c.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      // Preserve the drawing across resizes.
      const prev = document.createElement('canvas')
      prev.width = c.width
      prev.height = c.height
      prev.getContext('2d')?.drawImage(c, 0, 0)
      c.width = rect.width * dpr
      c.height = rect.height * dpr
      const ctx = c.getContext('2d')!
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, c.width, c.height)
      if (prev.width) ctx.drawImage(prev, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    speak('Pictează')
  }, [])

  function pos(e: RPointerEvent<HTMLCanvasElement>) {
    const c = canvasRef.current!
    const rect = c.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    return { x: (e.clientX - rect.left) * dpr, y: (e.clientY - rect.top) * dpr }
  }

  function stroke(a: { x: number; y: number }, b: { x: number; y: number }) {
    const ctx = canvasRef.current!.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    // The eraser is just a fat white brush.
    ctx.strokeStyle = erasingRef.current ? ERASE : colorRef.current
    ctx.lineWidth = (erasingRef.current ? brushRef.current * 1.6 : brushRef.current) * dpr
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  }

  function down(e: RPointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    drawing.current = true
    const p = pos(e)
    last.current = p
    stroke(p, p) // a dot on tap
  }
  function move(e: RPointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || !last.current) return
    const p = pos(e)
    stroke(last.current, p)
    last.current = p
  }
  function up() {
    drawing.current = false
    last.current = null
  }

  function clear() {
    const c = canvasRef.current!
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, c.width, c.height)
  }

  return (
    <div className="game">
      <TopBar title="Pictează" onBack={onBack} total={0} index={0} hideTitle />
      <div className="game-body">
        <button className="prompt" onClick={() => speak('Pictează')}>
          <span className="prompt-icon" aria-hidden="true">🔊</span>
          Pictează
        </button>
        <canvas
          ref={canvasRef}
          className="paint-canvas"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        />
        <div className="paint-palette">
          {PALETTE.map((c) => (
            <button
              key={c.name}
              className={'paint-swatch' + (!erasing && c.hex === color ? ' sel' : '')}
              style={{ background: c.hex }}
              onClick={() => {
                setColor(c.hex)
                setErasing(false)
              }}
              aria-label={c.name}
            />
          ))}
          <button
            className={'paint-swatch eraser-swatch' + (erasing ? ' sel' : '')}
            onClick={() => setErasing((e) => !e)}
            aria-label="radieră"
          >
            🧽
          </button>
        </div>
        <div className="tool-row">
          {BRUSHES.map((b) => (
            <button
              key={b}
              className={'brush-btn' + (b === brush ? ' sel' : '')}
              onClick={() => setBrush(b)}
              aria-label={`pensulă ${b}`}
            >
              <span
                className="brush-dot"
                style={{ width: b, height: b, background: erasing ? '#ced4da' : color }}
              />
            </button>
          ))}
          <button className="tool-btn" onClick={clear}>
            🗑️ Golește
          </button>
        </div>
      </div>
    </div>
  )
}
