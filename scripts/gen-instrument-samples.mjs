// Render realistic per-note samples for the free-play Instruments game from the
// FluidR3_GM soundfont (fluidsynth). Output: public/instruments/<inst>/<midi>.mp3
// (melodic), public/instruments/drums/<zone>.mp3, public/instruments/gong/gong.mp3.
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, '..', 'public', 'instruments')
const SF2 = '/usr/share/sounds/sf2/FluidR3_GM.sf2'
const TMP = '/tmp/inst-samples'
mkdirSync(TMP, { recursive: true })

function vlq(n) {
  const b = [n & 0x7f]
  n = Math.floor(n / 128)
  while (n > 0) { b.unshift((n & 0x7f) | 0x80); n = Math.floor(n / 128) }
  return b
}
function midiFile(track, division = 480) {
  const l = track.length
  return Buffer.from([
    0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, (division >> 8) & 255, division & 255,
    0x4d, 0x54, 0x72, 0x6b, (l >> 24) & 255, (l >> 16) & 255, (l >> 8) & 255, l & 255, ...track,
  ])
}
// One note (or drum hit) on a channel, then a tail of silence to capture decay.
function noteTrack({ program, note, channel = 0, hold, tail, vel = 0x68 }) {
  const ev = []
  if (program != null) ev.push(0x00, 0xc0 | channel, program)
  ev.push(0x00, 0x90 | channel, note, vel)
  ev.push(...vlq(hold), 0x80 | channel, note, 0x40)
  ev.push(...vlq(tail), 0xff, 0x2f, 0x00)
  return ev
}

function render(cfg, dst) {
  const mid = join(TMP, 'n.mid')
  const wav = join(TMP, 'n.wav')
  writeFileSync(mid, midiFile(noteTrack(cfg)))
  execFileSync('fluidsynth', ['-ni', '-g', '1.1', '-F', wav, '-r', '44100', SF2, mid], { stdio: 'ignore' })
  const max = cfg.max
  const fade = Math.max(0.05, max - 0.18)
  // Trim only the leading gap, cap the length, fade the end, boost a touch.
  // NO dynamic normalization — it would flatten the natural decay envelope.
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav,
    '-af', `silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02,atrim=0:${max},afade=t=out:st=${fade}:d=0.18,volume=2.0`,
    '-ac', '1', '-codec:a', 'libmp3lame', '-q:a', '5', dst], { stdio: 'ignore' })
}

// Melodic instruments: GM program + the exact MIDI notes each surface plays.
const MELODIC = [
  { id: 'piano', program: 0, notes: [60, 62, 64, 65, 67, 69, 71, 72], hold: 700, tail: 2600, max: 3.0 },
  { id: 'xylophone', program: 13, notes: [72, 74, 76, 79, 81, 84, 86, 88], hold: 240, tail: 1100, max: 1.6 },
  { id: 'flute', program: 73, notes: [72, 74, 76, 79, 81, 84, 86, 88], hold: 780, tail: 700, max: 1.6 },
  { id: 'piccolo', program: 72, notes: [84, 86, 88, 91, 93, 96, 98, 100], hold: 720, tail: 600, max: 1.4 },
  { id: 'bassoon', program: 70, notes: [48, 50, 52, 55, 57, 60, 62, 64], hold: 780, tail: 800, max: 1.7 },
]
for (const m of MELODIC) {
  const dir = join(OUT, m.id)
  mkdirSync(dir, { recursive: true })
  for (const note of m.notes) {
    render({ program: m.program, note, hold: m.hold, tail: m.tail, max: m.max }, join(dir, `${note}.mp3`))
  }
  console.log(`${m.id}: ${m.notes.length} notes`)
}

// Drum kit — GM percussion (channel 9). Zone id → { note, max length }.
const DRUMS = {
  kickL: { note: 36, max: 1.0 }, kickR: { note: 35, max: 1.0 },
  tomL: { note: 48, max: 1.2 }, tomR: { note: 45, max: 1.3 }, snare: { note: 38, max: 1.0 },
  hihat: { note: 42, max: 0.6 }, crashL: { note: 49, max: 2.2 }, crashC: { note: 57, max: 2.2 },
  crashR: { note: 55, max: 1.6 }, ride: { note: 51, max: 2.0 },
}
const ddir = join(OUT, 'drums')
mkdirSync(ddir, { recursive: true })
for (const [zone, d] of Object.entries(DRUMS)) {
  render({ program: null, note: d.note, channel: 9, hold: 40, tail: 4400, vel: 0x74, max: d.max }, join(ddir, `${zone}.mp3`))
}
console.log(`drums: ${Object.keys(DRUMS).length} zones`)

// Gong — Chinese cymbal (channel 9, note 52), long tail. Pitched by playbackRate in-app.
const gdir = join(OUT, 'gong')
mkdirSync(gdir, { recursive: true })
render({ program: null, note: 52, channel: 9, hold: 40, tail: 8000, vel: 0x76, max: 4.5 }, join(gdir, 'gong.mp3'))
console.log('gong: 1 sample')

rmSync(TMP, { recursive: true, force: true })
console.log('done →', OUT)
