// Record a set (letters or digits) ONE ITEM AT A TIME — no splitting, so nothing
// can get mixed up. For each item you press Enter, say it, and it's saved.
//
//   npm run record-digits                 # uses default mic, 2.5s per item
//   npm run record-letters -- <mic> <sec> # optional: pick a mic / longer window
//
// List mics with:  pactl list sources short | awk '{print $2}'
// After recording:  npm run gen-audio
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { LETTERS, DIGITS } from '../src/data/content.ts'

const SETS = { letters: LETTERS, digits: DIGITS }
const setName = process.argv[2]
const items = SETS[setName]
if (!items) {
  console.error('usage: node record-set.mjs <letters|digits> [mic] [seconds]')
  process.exit(1)
}
const mic = process.argv[3] || 'default'
const secs = process.argv[4] || '3'
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, 'assets', setName)
mkdirSync(OUT, { recursive: true })

const PAD = 0.16 // seconds kept around the word so quiet onsets/offsets aren't clipped

// Denoise the raw take, find the spoken word, and save just that word (padded so
// its quiet edges survive) normalised to `out`. Returns the clip duration, or 0
// if no speech was found (so the caller re-records instead of saving silence).
function makeClip(out) {
  try {
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', '/tmp/rec_raw.wav', '-af', 'highpass=f=90,afftdn=nf=-22', '/tmp/rec_dn.wav'])
    const total = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', '/tmp/rec_dn.wav']).toString().trim()
    const { stderr } = spawnSync('ffmpeg', ['-hide_banner', '-i', '/tmp/rec_dn.wav', '-af', 'silencedetect=noise=-48dB:d=0.15', '-f', 'null', '-'], { encoding: 'utf8' })
    const starts = [...stderr.matchAll(/silence_start: ([0-9.]+)/g)].map((m) => +m[1])
    const ends = [...stderr.matchAll(/silence_end: ([0-9.]+)/g)].map((m) => +m[1])
    const ws = ends.length ? ends[0] : 0 // end of leading silence = word onset
    const we = starts.length ? starts[starts.length - 1] : total // start of trailing silence = word offset
    if (we - ws < 0.08) return 0 // nothing but silence
    const from = Math.max(0, ws - PAD)
    const to = Math.min(total, we + PAD)
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(from), '-to', String(to), '-i', '/tmp/rec_dn.wav', '-af', 'loudnorm=I=-16:TP=-1.5,aresample=44100', '-ar', '44100', '-ac', '1', '-codec:a', 'libmp3lame', '-qscale:a', '3', out])
    return +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', out]).toString().trim() || 0
  } catch {
    return 0
  }
}

const rl = createInterface({ input, output })
console.log(`\nRecording ${items.length} ${setName} from mic "${mic}", ${secs}s each.`)
console.log('For each: press Enter, then say it clearly. You can redo any one.\n')

for (const item of items) {
  const out = join(OUT, `${item}.mp3`)
  let done = false
  while (!done) {
    await rl.question(`➡  "${item}"  — press Enter, then say it… `)
    console.log('   ● recording — speak now…')
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'pulse', '-i', mic, '-t', secs, '/tmp/rec_raw.wav'])
    const dur = makeClip(out)
    if (dur < 0.15) {
      console.log('   ⚠ No speech captured — say it a bit louder/closer, right after Enter. Redoing this one.')
      continue
    }
    const a = (await rl.question(`   ✓ saved "${item}" (${dur.toFixed(2)}s). Enter = next, r = redo: `)).trim().toLowerCase()
    done = a !== 'r'
  }
}

rl.close()
console.log('\nAll done! Now run:  npm run gen-audio')
