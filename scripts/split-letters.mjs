// Split ONE recording of a whole set (the alphabet or the digits) into one clip
// per item. Record yourself saying the names IN ORDER, with a clear pause (~1s)
// between each, then:
//
//   npm run split-letters -- path/to/alphabet.(m4a|mp3|wav)
//   npm run split-digits  -- path/to/numbers.(m4a|mp3|wav)
//
// Letters order:  A Ă Â B C D E F G H I Î J K L M N O P Q R S Ș T Ț U V W X Y Z
// Digits order:   0 1 2 3 4 5 6 7 8 9  (zero, unu, doi, trei, patru, …)
//
// It auto-tunes the silence threshold to find exactly the right count. If it
// can't, it reports the closest attempt so you can re-record with clearer pauses.
// Force settings:  npm run split-letters -- <file> <noiseDb> <minSilence>
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { LETTERS, DIGITS } from '../src/data/content.ts'

const HERE = dirname(fileURLToPath(import.meta.url))
const SETS = { letters: LETTERS, digits: DIGITS }
const setName = process.argv[2]
const items = SETS[setName]
if (!items) {
  console.error(`usage: node split-letters.mjs <letters|digits> <recording> [noiseDb] [minSilence]`)
  process.exit(1)
}
const OUT = join(HERE, 'assets', setName)
const TARGET = items.length
const PAD = 0.12 // seconds of the silence gap kept on each side, so nothing clips

const input = process.argv[3]
if (!input || !existsSync(input)) {
  console.error(`usage: npm run split-${setName} -- <recording> [noiseDb] [minSilence]`)
  process.exit(1)
}

const total = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', input])
  .toString()
  .trim()

// Detect speech segments (regions between silences) for given settings.
function detect(noiseDb, minSil) {
  const { stderr } = spawnSync(
    'ffmpeg',
    ['-hide_banner', '-i', input, '-af', `silencedetect=noise=${noiseDb}dB:d=${minSil}`, '-f', 'null', '-'],
    { encoding: 'utf8' }
  )
  const starts = [...stderr.matchAll(/silence_start: ([0-9.]+)/g)].map((m) => +m[1])
  const ends = [...stderr.matchAll(/silence_end: ([0-9.]+)/g)].map((m) => +m[1])
  const segs = []
  let cur = 0
  for (let i = 0; i < starts.length; i++) {
    if (starts[i] > cur) segs.push([cur, starts[i]])
    cur = ends[i] ?? starts[i]
  }
  if (total > cur) segs.push([cur, total])
  return segs.filter(([a, b]) => b - a > 0.05)
}

// Find settings that yield exactly TARGET segments (or the closest).
let chosen = null
let closest = null
if (process.argv[4] && process.argv[5]) {
  chosen = { segs: detect(process.argv[4], process.argv[5]), noiseDb: process.argv[4], minSil: process.argv[5] }
} else {
  // Prefer LONGER required-silence first: short pauses inside a multi-word name
  // ("î din a", "dublu ve") then don't get mistaken for gaps between letters.
  for (const minSil of [0.6, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.7]) {
    // Prefer lower (more inclusive) thresholds first — wider boundaries, less clipping.
    for (const noiseDb of [-45, -40, -35, -30, -50, -25, -20]) {
      const segs = detect(noiseDb, minSil)
      if (segs.length === TARGET) {
        chosen = { segs, noiseDb, minSil }
        break
      }
      if (!closest || Math.abs(segs.length - TARGET) < Math.abs(closest.segs.length - TARGET))
        closest = { segs, noiseDb, minSil }
    }
    if (chosen) break
  }
}

const result = chosen ?? closest
console.log(`Best split: ${result.segs.length} segments (noise=${result.noiseDb}dB, minSilence=${result.minSil}s); need ${TARGET}.`)
if (result.segs.length !== TARGET) {
  result.segs.forEach(([a, b], i) => console.log(`  ${i + 1}: ${a.toFixed(2)}–${b.toFixed(2)}s`))
  console.error('\nCould not find exactly ' + TARGET + '. Re-record with clearer, even pauses between letters.')
  process.exit(2)
}

mkdirSync(OUT, { recursive: true })
// Pad each segment into the surrounding silence so quiet onsets/offsets aren't
// clipped, then trim only true silence (-52 dB, well below any letter's edges).
const POST =
  'silenceremove=start_periods=1:start_threshold=-52dB:start_duration=0.02:stop_periods=-1:stop_threshold=-52dB:stop_duration=0.12,loudnorm=I=-16:TP=-1.5,aresample=44100'
result.segs.forEach(([a, b], i) => {
  const item = items[i]
  const from = Math.max(0, a - PAD)
  const to = Math.min(total, b + PAD)
  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error', '-ss', String(from), '-to', String(to), '-i', input,
    '-af', POST, '-ar', '44100', '-ac', '1', '-codec:a', 'libmp3lame', '-qscale:a', '3',
    join(OUT, `${item}.mp3`),
  ])
  console.log(`  ${item}  ←  ${from.toFixed(2)}–${to.toFixed(2)}s`)
})
console.log(`\nWrote ${result.segs.length} clips to ${OUT}`)

// --- Build a review clip: "expected name" (TTS) then YOUR recording, per item,
// so you can hear at a glance whether anything got mixed up. ---
const PIP = join(HERE, '.piper', 'piper-bin', 'piper')
const MODEL = join(HERE, '.piper', 'mihai.onnx')
if (existsSync(PIP) && existsSync(MODEL)) {
  const rev = join(HERE, `.review-${setName}`)
  mkdirSync(rev, { recursive: true })
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', '0.5', join(rev, 'sil.wav')])
  const list = []
  items.forEach((it, i) => {
    execFileSync(PIP, ['--model', MODEL, '--length_scale', '1.3', '--output_file', join(rev, `l${i}.wav`)], { input: String(it) })
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', join(rev, `l${i}.wav`), '-ar', '44100', '-ac', '1', join(rev, `L${i}.wav`)])
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', join(OUT, `${it}.mp3`), '-ar', '44100', '-ac', '1', join(rev, `C${i}.wav`)])
    list.push(`file '${join(rev, `L${i}.wav`)}'`, `file '${join(rev, 'sil.wav')}'`, `file '${join(rev, `C${i}.wav`)}'`, `file '${join(rev, 'sil.wav')}'`)
  })
  writeFileSync(join(rev, 'list.txt'), list.join('\n'))
  const reviewOut = join(HERE, '..', 'public', 'audio-test', `review-${setName}.mp3`)
  mkdirSync(dirname(reviewOut), { recursive: true })
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', join(rev, 'list.txt'), '-codec:a', 'libmp3lame', '-qscale:a', '4', reviewOut])
  rmSync(rev, { recursive: true, force: true })
  console.log(`\n▶ CHECK IT FIRST:  ffplay public/audio-test/review-${setName}.mp3`)
  console.log(`  (each item plays the expected name, then your recording — they should match)`)
}
console.log(`\nIf the review sounds right:  npm run gen-audio`)
