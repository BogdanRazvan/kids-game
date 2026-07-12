import { ReactNode, useEffect, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { GameProps } from '../lib/game'
import { boom, getSample, loadSample, noiseBurst, playBuffer, speak, tone } from '../lib/audio'

// Free musical play: pick an instrument, then tap to make sounds. Nothing is
// wrong — the pitched instruments use a pentatonic scale so it all sounds nice.
// Notes are realistic samples rendered from the FluidR3_GM soundfont (see
// scripts/gen-instrument-samples.mjs); the synth voices below are the fallback.

const SBASE = import.meta.env.BASE_URL + 'instruments/'

// --- Fallback synth voices (used only if a sample hasn't loaded) -----------
function piano(f: number) {
  tone(f, 1.1, 'triangle', 0, 0.13)
  tone(f * 2, 0.5, 'sine', 0, 0.04)
}
function xylophone(f: number) {
  tone(f, 0.5, 'triangle', 0, 0.16)
  tone(f * 4, 0.12, 'sine', 0, 0.05)
}
function flute(f: number) {
  tone(f, 0.9, 'sine', 0, 0.15)
  tone(f * 2, 0.4, 'sine', 0, 0.025)
  noiseBurst(0.14, { gain: 0.012, hp: 2500 }) // a soft breath
}
function piccolo(f: number) {
  tone(f, 0.6, 'sine', 0, 0.09)
  tone(f * 2, 0.25, 'sine', 0, 0.03)
  noiseBurst(0.05, { gain: 0.006, hp: 6000 })
}
function bassoon(f: number) {
  tone(f, 1.0, 'sawtooth', 0, 0.08) // reedy buzz
  tone(f * 2, 0.5, 'triangle', 0, 0.035)
  tone(f, 0.9, 'sine', 0, 0.05) // warm body
}
function gong(base: number) {
  // A deep metallic wash: low fundamental + inharmonic partials + shimmer.
  tone(base, 2.4, 'sine', 0, 0.15)
  tone(base * 1.6, 1.9, 'sine', 0, 0.08)
  tone(base * 2.55, 1.5, 'triangle', 0, 0.05)
  tone(base * 3.4, 1.1, 'sine', 0, 0.035)
  noiseBurst(1.7, { gain: 0.05, hp: base * 5, lp: 6000 })
}
const GONGS = [
  { id: 'gongL', base: 80, rate: 0.6, cx: 76, cy: 116, r: 50 },
  { id: 'gongM', base: 112, rate: 0.82, cx: 158, cy: 104, r: 40 },
  { id: 'gongS', base: 152, rate: 1.05, cx: 232, cy: 94, r: 31 },
]

// Pitched scales
const PENTA = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51] // C D E G A C D E
const PENTA_HIGH = PENTA.map((f) => f * 2) // piccolo — an octave up
const PENTA_LOW = PENTA.map((f) => f / 4) // bassoon — two octaves down
const DIATONIC = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25] // C D E F G A B C
const BAR_COLORS = ['#e6394b', '#f3722c', '#f9c80e', '#43aa8b', '#1d7bd6', '#6741d9', '#e8348c', '#0ca678']

// Woodwind body palettes: [gradTop, gradMid, gradBottom, stroke, blowHole, holeRing]
const METAL = ['#f8f9fa', '#ced4da', '#adb5bd', '#868e96', '#495057', '#b0b6bd']
const WOOD = ['#e6bd7e', '#c9852b', '#a3651d', '#734710', '#3a2a12', '#a9772f']
const WOOD_DARK = ['#b07e46', '#7a4a1e', '#5c3411', '#3d220a', '#241407', '#6b4423']

// Drum-kit voices
const DRUM: Record<string, () => void> = {
  kickL: () => boom(150, 45, 0.42, 0.32),
  kickR: () => boom(138, 42, 0.44, 0.32),
  tomL: () => boom(245, 120, 0.3, 0.24),
  tomR: () => boom(200, 100, 0.34, 0.24),
  snare: () => { boom(190, 95, 0.2, 0.18); noiseBurst(0.2, { gain: 0.16, hp: 1500 }) },
  hihat: () => noiseBurst(0.06, { gain: 0.12, hp: 8000 }),
  crashL: () => noiseBurst(0.7, { gain: 0.13, hp: 3500 }),
  crashC: () => noiseBurst(0.6, { gain: 0.13, hp: 4200 }),
  crashR: () => noiseBurst(0.65, { gain: 0.13, hp: 3800 }),
  ride: () => { tone(820, 0.5, 'sine', 0, 0.05); noiseBurst(0.45, { gain: 0.07, hp: 6000 }) },
}

type Kind = 'keys' | 'bars' | 'flute' | 'drums' | 'gong'
type Material = 'silver' | 'wood' | 'woodDark'
type Instrument = {
  id: string
  label: string
  emoji: string
  kind: Kind
  accent: string
  voice?: (f: number) => void
  scale?: number[]
  colors?: string[]
  material?: Material // for woodwinds
  small?: boolean // for woodwinds (piccolo)
  sampleDir?: string // folder under public/instruments/
  midi?: number[] // MIDI note per scale step → sample file name
}

const INSTRUMENTS: Instrument[] = [
  { id: 'pian', label: 'Pian', emoji: '🎹', kind: 'keys', accent: '#7048e8', voice: piano, scale: DIATONIC, sampleDir: 'piano', midi: [60, 62, 64, 65, 67, 69, 71, 72] },
  { id: 'xilofon', label: 'Xilofon', emoji: '🎵', kind: 'bars', accent: '#1d7bd6', voice: xylophone, scale: PENTA, colors: BAR_COLORS, sampleDir: 'xylophone', midi: [72, 74, 76, 79, 81, 84, 86, 88] },
  { id: 'flaut', label: 'Flaut', emoji: '🪈', kind: 'flute', accent: '#c9852b', voice: flute, scale: PENTA, material: 'wood', sampleDir: 'flute', midi: [72, 74, 76, 79, 81, 84, 86, 88] },
  { id: 'piculina', label: 'Piculină', emoji: '🪈', kind: 'flute', accent: '#22b8cf', voice: piccolo, scale: PENTA_HIGH, material: 'silver', small: true, sampleDir: 'piccolo', midi: [84, 86, 88, 91, 93, 96, 98, 100] },
  { id: 'fagot', label: 'Fagot', emoji: '🎼', kind: 'flute', accent: '#8a5a2b', voice: bassoon, scale: PENTA_LOW, material: 'woodDark', sampleDir: 'bassoon', midi: [48, 50, 52, 55, 57, 60, 62, 64] },
  { id: 'gong', label: 'Gong', emoji: '🥇', kind: 'gong', accent: '#c9871f' },
  { id: 'tobe', label: 'Tobe', emoji: '🥁', kind: 'drums', accent: '#e03131' },
]

const NOTES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si', 'Do']
const SHELL = '#7a2233'
const SHELL_DARK = '#5c1626'
const HEAD = '#f3f0ea'
const CYMBAL = '#d9b382'
const STEEL = '#9aa0a6'

// URLs of every sample an instrument needs (preloaded when it's selected).
function sampleUrls(inst: Instrument): string[] {
  if (inst.sampleDir && inst.midi) return inst.midi.map((m) => `${SBASE}${inst.sampleDir}/${m}.mp3`)
  if (inst.kind === 'drums') return Object.keys(DRUM).map((z) => `${SBASE}drums/${z}.mp3`)
  if (inst.kind === 'gong') return [`${SBASE}gong/gong.mp3`]
  return []
}

export function Instruments({ onBack }: GameProps) {
  const [sel, setSel] = useState(0)
  const [hit, setHit] = useState<number | string | null>(null)
  const inst = INSTRUMENTS[sel]

  // Preload the selected instrument's samples (cached across selections).
  useEffect(() => {
    sampleUrls(inst).forEach(loadSample)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel])

  useEffect(() => {
    speak('Instrumente')
  }, [])

  function flash(id: number | string) {
    setHit(id)
    window.setTimeout(() => setHit((h) => (h === id ? null : h)), 200)
  }
  // Play a realistic sample if loaded, otherwise fall back to the synth voice.
  function playNote(i: number) {
    const buf = inst.midi && getSample(`${SBASE}${inst.sampleDir}/${inst.midi[i]}.mp3`)
    if (buf) playBuffer(buf, 0.95)
    else inst.voice?.(inst.scale![i])
    flash(i)
  }
  function strike(id: string) {
    const buf = getSample(`${SBASE}drums/${id}.mp3`)
    if (buf) playBuffer(buf, 0.9)
    else DRUM[id]()
    flash(id)
  }
  function bang(g: (typeof GONGS)[number]) {
    const buf = getSample(`${SBASE}gong/gong.mp3`)
    if (buf) playBuffer(buf, 0.9, g.rate)
    else gong(g.base)
    flash(g.id)
  }

  // --- Drum-kit pieces (each is its own clickable zone) --------------------
  const part = (id: string, children: ReactNode) => (
    <g
      className={'drum-part' + (hit === id ? ' hit' : '')}
      onPointerDown={() => strike(id)}
      style={{ cursor: 'pointer' }}
      aria-label={id}
    >
      {children}
    </g>
  )
  const stand = (cx: number, cy: number) => (
    <g stroke={STEEL} fill="none" strokeWidth={2} strokeLinecap="round">
      <line x1={cx} y1={cy} x2={cx} y2={108} />
      <line x1={cx} y1={101} x2={cx - 8} y2={112} />
      <line x1={cx} y1={101} x2={cx + 8} y2={112} />
    </g>
  )
  const cymbal = (id: string, cx: number, cy: number, rx: number) =>
    part(id, (
      <>
        <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.28} fill={CYMBAL} stroke="#b8935f" strokeWidth={1.2} />
        <ellipse cx={cx} cy={cy} rx={rx * 0.55} ry={rx * 0.16} fill="none" stroke="#00000018" strokeWidth={1} />
        <ellipse cx={cx} cy={cy} rx={rx * 0.16} ry={rx * 0.09} fill="#c19a63" />
      </>
    ))
  const tom = (id: string, cx: number, cy: number, rx: number, ry: number) =>
    part(id, (
      <>
        <ellipse cx={cx} cy={cy + 3} rx={rx + 1.5} ry={ry + 1.5} fill={SHELL} />
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={HEAD} stroke={SHELL_DARK} strokeWidth={1.5} />
      </>
    ))
  const kick = (id: string, cx: number, cy: number, r: number) =>
    part(id, (
      <>
        <circle cx={cx} cy={cy} r={r} fill={SHELL} />
        <circle cx={cx} cy={cy} r={r - 4} fill={HEAD} stroke="#cfc9bd" strokeWidth={1} />
        <circle cx={cx} cy={cy} r={r * 0.12} fill={SHELL} />
        <line x1={cx - r} y1={cy + r - 3} x2={cx - r - 5} y2={cy + r + 8} stroke={SHELL_DARK} strokeWidth={2.5} strokeLinecap="round" />
        <line x1={cx + r} y1={cy + r - 3} x2={cx + r + 5} y2={cy + r + 8} stroke={SHELL_DARK} strokeWidth={2.5} strokeLinecap="round" />
      </>
    ))
  const snare = (id: string, cx: number, cy: number, rx: number, ry: number) =>
    part(id, (
      <>
        <line x1={cx} y1={cy} x2={cx} y2={108} stroke={STEEL} strokeWidth={2} />
        <ellipse cx={cx} cy={cy + 2.5} rx={rx + 1} ry={ry + 1} fill="#c0c4c9" />
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={HEAD} stroke="#8a8d92" strokeWidth={1.5} />
      </>
    ))

  return (
    <div className="game">
      <TopBar title="Instrumente" onBack={onBack} total={0} index={0} hideTitle />
      <div className="game-body">
        <button className="prompt" onClick={() => speak('Instrumente')}>
          <span className="prompt-icon" aria-hidden="true">🔊</span>
          Instrumente
        </button>
        <div className="inst-picker">
          {INSTRUMENTS.map((it, i) => (
            <button
              key={it.id}
              className={'inst-tab' + (i === sel ? ' sel' : '')}
              style={{ ['--c' as string]: it.accent } as React.CSSProperties}
              onClick={() => setSel(i)}
            >
              <span className="inst-tab-emoji">{it.emoji}</span>
              <span className="inst-tab-label">{it.label}</span>
            </button>
          ))}
        </div>

        {inst.kind === 'keys' && (
          <div className="piano">
            {inst.scale!.map((_, i) => (
              <button
                key={i}
                className={'key' + (hit === i ? ' hit' : '')}
                onPointerDown={() => playNote(i)}
                aria-label={`nota ${NOTES[i]}`}
              >
                <span className="key-label">{NOTES[i]}</span>
              </button>
            ))}
          </div>
        )}

        {inst.kind === 'bars' && (
          <div className="xylo">
            {inst.scale!.map((_, i) => (
              <button
                key={i}
                className={'xylo-bar' + (hit === i ? ' hit' : '')}
                style={{ background: inst.colors![i], height: `${100 - i * 7}%` }}
                onPointerDown={() => playNote(i)}
                aria-label={`nota ${NOTES[i]}`}
              >
                <span className="xylo-peg" />
                <span className="xylo-peg bottom" />
              </button>
            ))}
          </div>
        )}

        {inst.kind === 'flute' && (() => {
          const mat = inst.material ?? 'silver'
          const body = mat === 'wood' ? WOOD : mat === 'woodDark' ? WOOD_DARK : METAL
          return (
            <div
              className={'flute' + (inst.small ? ' small' : '')}
              style={{ ['--c' as string]: inst.accent } as React.CSSProperties}
            >
              <svg viewBox="0 0 300 70">
                <defs>
                  <linearGradient id="wind-body" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={body[0]} />
                    <stop offset="0.5" stopColor={body[1]} />
                    <stop offset="1" stopColor={body[2]} />
                  </linearGradient>
                </defs>
                <rect x="6" y="20" width="26" height="30" rx="10" fill="url(#wind-body)" stroke={body[3]} />
                <rect x="20" y="25" width="266" height="20" rx="10" fill="url(#wind-body)" stroke={body[3]} />
                <ellipse cx="286" cy="35" rx="6" ry="12" fill={body[2]} stroke={body[3]} />
                <ellipse cx="18" cy="30" rx="4" ry="2.5" fill={body[4]} />
                {inst.scale!.map((_, i) => {
                  const x = 52 + i * 30
                  return (
                    <g
                      key={i}
                      className={'flute-hole' + (hit === i ? ' hit' : '')}
                      onPointerDown={() => playNote(i)}
                      aria-label={`nota ${NOTES[i]}`}
                    >
                      <circle className="hole-ring" cx={x} cy={35} r={8} fill={body[5]} />
                      <circle className="hole-core" cx={x} cy={35} r={5} />
                      <circle cx={x} cy={35} r={15} fill="transparent" />
                    </g>
                  )
                })}
              </svg>
            </div>
          )
        })()}

        {inst.kind === 'drums' && (
          <div className="drumkit">
            <svg viewBox="0 0 200 118">
              {/* stands (behind) */}
              {stand(22, 54)}
              {stand(56, 28)}
              {stand(100, 20)}
              {stand(144, 28)}
              {stand(178, 54)}
              {/* upper cymbals (behind the toms) */}
              {cymbal('crashC', 100, 20, 26)}
              {cymbal('crashL', 56, 28, 22)}
              {cymbal('crashR', 144, 28, 22)}
              {/* rack toms */}
              {tom('tomL', 86, 50, 17, 12)}
              {tom('tomR', 114, 50, 17, 12)}
              {/* bass drums */}
              {kick('kickL', 72, 84, 25)}
              {kick('kickR', 128, 84, 25)}
              {/* snare (front centre) */}
              {snare('snare', 100, 90, 15, 7)}
              {/* big side cymbals (front) */}
              {cymbal('hihat', 22, 54, 20)}
              {cymbal('ride', 178, 54, 20)}
            </svg>
          </div>
        )}

        {inst.kind === 'gong' && (
          <div className="gong">
            <svg viewBox="0 0 300 200">
              <defs>
                <radialGradient id="gong-grad" cx="0.4" cy="0.35" r="0.75">
                  <stop offset="0" stopColor="#f5e19a" />
                  <stop offset="0.55" stopColor="#cc9a3a" />
                  <stop offset="1" stopColor="#8a6520" />
                </radialGradient>
              </defs>
              {/* frame */}
              <rect x="16" y="14" width="268" height="10" rx="5" fill="#6b4423" />
              <rect x="18" y="18" width="10" height="172" rx="4" fill="#5c3a1a" />
              <rect x="272" y="18" width="10" height="172" rx="4" fill="#5c3a1a" />
              <line x1="23" y1="190" x2="8" y2="196" stroke="#5c3a1a" strokeWidth="5" strokeLinecap="round" />
              <line x1="277" y1="190" x2="292" y2="196" stroke="#5c3a1a" strokeWidth="5" strokeLinecap="round" />
              {/* cords */}
              {GONGS.map((g) => (
                <g key={g.id + 'c'} stroke="#7a5730" strokeWidth="1.5">
                  <line x1={g.cx - g.r * 0.5} y1="22" x2={g.cx - g.r * 0.55} y2={g.cy - g.r * 0.85} />
                  <line x1={g.cx + g.r * 0.5} y1="22" x2={g.cx + g.r * 0.55} y2={g.cy - g.r * 0.85} />
                </g>
              ))}
              {/* gong discs */}
              {GONGS.map((g) => (
                <g
                  key={g.id}
                  className={'drum-part' + (hit === g.id ? ' hit' : '')}
                  onPointerDown={() => bang(g)}
                  style={{ cursor: 'pointer' }}
                  aria-label={g.id}
                >
                  <circle cx={g.cx} cy={g.cy} r={g.r} fill="url(#gong-grad)" stroke="#7a5518" strokeWidth="2.5" />
                  <circle cx={g.cx} cy={g.cy} r={g.r * 0.72} fill="none" stroke="#a5772f" strokeWidth="1.5" />
                  <circle cx={g.cx} cy={g.cy} r={g.r * 0.42} fill="none" stroke="#a5772f" strokeWidth="1.5" />
                  <circle cx={g.cx} cy={g.cy} r={g.r * 0.16} fill="#a5772f" />
                </g>
              ))}
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
