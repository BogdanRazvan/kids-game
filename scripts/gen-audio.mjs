// Pre-render every phrase the app speaks into bundled MP3 clips, so sound works
// in ANY browser and offline — no dependency on the device having a Romanian
// text-to-speech voice. Run with:  npm run gen-audio
//
// Voice: uses the Piper neural voice (natural sounding) when scripts/.piper/ is
// present — run scripts/setup-piper.sh once to download it. Falls back to the
// robotic espeak-ng renderer otherwise. Needs ffmpeg either way.
//
// The generated clips + manifest are committed, so end users never need this —
// it's only re-run when the spoken phrases change.
import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { COLORS, SHAPES, LETTERS, DIGITS } from '../src/data/content.ts'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const AUDIO_DIR = join(ROOT, 'public', 'audio')
const MANIFEST = join(ROOT, 'src', 'lib', 'speechManifest.ts')
const ESPEAK_BIN = join(HERE, 'espeak_tts')
const ESPEAK_LIB = '/lib/x86_64-linux-gnu/libespeak-ng.so.1'
const PIPER_BIN = join(HERE, '.piper', 'piper-bin', 'piper')
const PIPER_MODEL = join(HERE, '.piper', 'mihai.onnx')
const usePiper = existsSync(PIPER_BIN) && existsSync(PIPER_MODEL)

// Default speaking rate (length_scale > 1 = slower, clearer for small kids).
const LENGTH_SCALE = 1.25

// Per-phrase tuning for words the model renders unclearly. `length` slows just
// that word; `synth` overrides the exact text fed to the voice (the app still
// looks it up by the original key). A trailing period gives a short word a
// clean statement-final ending instead of a clipped one.
const OVERRIDES = {}
// Colour names are short standalone words the model tends to rush — slow each
// down and give it a clean ending so it's crisp on its own.
COLORS.forEach((c) => {
  OVERRIDES[c.name] = { length: 1.5, synth: `${c.name}.` }
})
// "mov" is a single syllable — the hardest case; slow it down further.
OVERRIDES.mov = { length: 1.8, synth: 'mov.' }
// "roșu": spell with extra r's so espeak phonemises a proper rolled Romanian r
// (r@-* trill) instead of a soft one. The app still looks it up as "roșu".
OVERRIDES.roșu = { length: 1.5, synth: 'rrroșu.' }
// Shape names are short standalone words too — slow slightly + clean ending.
SHAPES.forEach((s) => {
  OVERRIDES[s.name] = { length: 1.4, synth: `${s.name}.` }
})
// "pătrat": extra r's for a stronger rolled Romanian r.
OVERRIDES['pătrat'] = { length: 1.4, synth: 'pătrrrat.' }
// Letters spoken by their common Romanian names (el, ef, em, en, er, es — the
// everyday forms, not the reformed le/fe/me…). Rendered slower with a clean
// ending. "ell" is used for L so espeak doesn't say the word "el" as /jel/.
// D/P/T use an accent (dé/pé/té) to force a stressed, clear "e" — otherwise
// espeak reads them as the unstressed prepositions de/pe/te and they slur to "da".
const LETTER_SAY = {
  A: 'a', 'Ă': 'ă', 'Â': 'î din a', B: 'be', C: 'ce', D: 'dé', E: 'e', F: 'ef',
  G: 'ge', H: 'haș', I: 'i', 'Î': 'î din i', J: 'je', K: 'ka', L: 'ell', M: 'em',
  N: 'en', O: 'o', P: 'pé', Q: 'chiu', R: 'er', S: 'es', 'Ș': 'șe', T: 'té',
  'Ț': 'țe', U: 'u', V: 've', W: 'dublu ve', X: 'ics', Y: 'i grec', Z: 'zet',
}
LETTERS.forEach((l) => {
  OVERRIDES[l] = { length: 1.5, synth: `${LETTER_SAY[l]}.` }
})
// Digits spoken as their Romanian number names, slower with a clean ending.
// "ș" is doubled so the fricative in șase/șapte isn't swallowed.
const DIGIT_SAY = {
  '0': 'zero', '1': 'unu', '2': 'doi', '3': 'trei', '4': 'patru',
  '5': 'cinci', '6': 'șșase', '7': 'șșapte', '8': 'opt', '9': 'nouă',
}
DIGITS.forEach((d) => {
  OVERRIDES[d] = { length: 1.4, synth: `${DIGIT_SAY[d]}.` }
})
// Q: /k/ before /i/ fronts to "t" ("tiu"); use the other valid name "cu" (koo).
OVERRIDES['Q'] = { length: 1.5, synth: 'cú.' }
// Ș: double the "ș" so the fricative is strong and clear, not swallowed.
OVERRIDES['Ș'] = { length: 1.6, synth: 'șșe.' }
// The end-of-game cheer — slower so it lands clearly.
OVERRIDES['Bravo! Ai reușit!'] = { length: 1.5 }
// Question intros: statement intonation (the "?" render rushes the ending) + slower.
OVERRIDES['Cine face?'] = { length: 1.5, synth: 'Cine face.' }
// Long question — statement intonation, and pronounce "față" (not "fata"/girl).
OVERRIDES['Care obiect e diferit fata de celelalte?'] = {
  length: 1.4,
  synth: 'Care obiect e diferit față de celelalte.',
}
OVERRIDES['Ce formă urmează?'] = { length: 1.5, synth: 'Ce formă urmează.' }
OVERRIDES['Ce instrument se aude?'] = { length: 1.5, synth: 'Ce instrument se aude.' }
OVERRIDES['Care este rezultatul adunării?'] = { length: 1.4, synth: 'Care este rezultatul adunării.' }
OVERRIDES['Ce număr lipsește?'] = { length: 1.5, synth: 'Ce număr lipsește.' }
OVERRIDES['Ce mănâncă?'] = { length: 1.5, synth: 'Ce mănâncă.' }
// Sizes words — short, so clean ending + a little slower.
OVERRIDES['cel mare'] = { length: 1.4, synth: 'cel mare.' }
OVERRIDES['cel mic'] = { length: 1.4, synth: 'cel mic.' }
// "triunghi" gets mangled ("triundi") as one token; lean on the known word
// "unghi" (hard g before i) by splitting: "tri-unghi".
OVERRIDES['triunghi'] = { synth: 'tri-unghi' }

function piperSynth(text, wav, length) {
  execFileSync(PIPER_BIN, ['--model', PIPER_MODEL, '--length_scale', String(length), '--sentence_silence', '0.45', '--output_file', wav], { input: text })
}

// Render one phrase to a WAV file, natural voice if Piper is available.
function renderWav(text, wav) {
  const o = OVERRIDES[text] || {}
  const length = o.length ?? LENGTH_SCALE
  const synth = o.synth ?? text

  if (!usePiper) {
    execFileSync(ESPEAK_BIN, ['ro', synth, wav])
    return
  }

  if (o.carrier) {
    // Say the word 3× and keep the middle utterance: its onset is mid-buffer,
    // so the initial consonant can't be clipped the way it is at the start.
    const full = wav.replace(/\.wav$/, '.full.wav')
    piperSynth(`${synth}. ${synth}. ${synth}.`, full, length)
    const { stderr } = spawnSync('ffmpeg', ['-hide_banner', '-i', full, '-af', 'silencedetect=noise=-45dB:d=0.15', '-f', 'null', '-'], { encoding: 'utf8' })
    const ends = [...stderr.matchAll(/silence_end: ([0-9.]+)/g)].map((m) => m[1])
    const starts = [...stderr.matchAll(/silence_start: ([0-9.]+)/g)].map((m) => m[1])
    if (ends[0] && starts[1]) {
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', ends[0], '-to', starts[1], '-i', full, wav])
      rmSync(full)
      return
    }
    // Segmentation failed (e.g. a very short fricative) — fall back to one render.
    rmSync(full)
    piperSynth(synth, wav, length)
    return
  }

  piperSynth(synth, wav, length)
}

// Clean-up chain: drop synth rumble, gently even out the level, upsample to
// 44.1 kHz. Intentionally soft — no presence EQ, which made short words harsh.
const POST_FILTER = 'highpass=f=70,dynaudnorm=p=0.6,aresample=44100'

// --- Every distinct string passed to speak() anywhere in the app ---
const phrases = new Set()
// Each game speaks an intro stem once, then just the changing word per round.
COLORS.forEach((c) => phrases.add(c.name))
SHAPES.forEach((s) => phrases.add(s.name))
LETTERS.forEach((l) => phrases.add(l)) // spoken as Romanian letter names
DIGITS.forEach((d) => phrases.add(d)) // spoken as Romanian number names
// Animals play REAL sound effects (see below), not spoken onomatopoeia.
;[
  // game intros (spoken once on entry)
  'Apasă pe culoarea',
  'Găsește forma de',
  'Cine face?',
  'Apasă pe numărul potrivit',
  'Găsește umbra',
  'Apasă pe obiectul',
  'cel mare',
  'cel mic',
  'Care obiect e diferit fata de celelalte?',
  'Ce formă urmează?',
  'Găsește obiectul din poză',
  'Găsește litera',
  'Găsește cifra',
  'Găsește intrusul',
  'Găsește diferențele',
  'Găsește locul potrivit al fiecărei imagini',
  'Care este rezultatul adunării?',
  'Ce număr lipsește?',
  'Ajută șoricelul să găsească brânza',
  'Unește punctele în ordine',
  'Ce mănâncă?',
  // animals eating (Food game) — spoken after the prompt
  'vaca',
  'iepurele',
  'maimuța',
  'șoarecele',
  'câinele',
  'pisica',
  'ursul',
  'ursulețul koala',
  'Ține minte și repetă',
  'Apasă pe obiecte, în ordine, de la mic la mare',
  'Pune fiecare obiect în căsuța potrivită',
  'Ce instrument se aude?',
  'Apasă pe mai multe',
  'Apasă pe mai puține',
  // other spoken phrases
  'Mai încearcă',
  'Găsește perechile',
  'Bravo! Ai reușit!',
  // game titles (spoken when a game starts)
  'Culori',
  'Numărăm',
  'Forme',
  'Animale',
  'Memorie',
  'Umbre',
  'Mărime',
  'Diferit',
  'Modele',
  'La fel',
  'Litere',
  'Cifre',
  'Mai mult',
  'Intrusul',
  'Muzică',
  // activity titles (spoken when an activity starts)
  'Colorează',
  'Pictează',
  'Sparge bulele',
  'Instrumente',
].forEach((s) => phrases.add(s))

const fileFor = (text) => createHash('sha1').update(text).digest('hex').slice(0, 16) + '.mp3'

// --- Build the espeak fallback renderer if we'll need it ---
console.log(usePiper ? 'voice: Piper neural (mihai)' : 'voice: espeak-ng (robotic fallback)')
if (!usePiper && !existsSync(ESPEAK_BIN)) {
  console.log('compiling espeak_tts…')
  execFileSync('gcc', ['-O2', '-o', ESPEAK_BIN, join(HERE, 'espeak_tts.c'), ESPEAK_LIB], { stdio: 'inherit' })
}

// --- Fresh audio dir ---
if (existsSync(AUDIO_DIR)) for (const f of readdirSync(AUDIO_DIR)) rmSync(join(AUDIO_DIR, f))
else mkdirSync(AUDIO_DIR, { recursive: true })

const manifest = {}
let n = 0
for (const text of phrases) {
  const mp3 = fileFor(text)
  const wav = join(AUDIO_DIR, mp3.replace('.mp3', '.wav'))
  renderWav(text, wav)
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-af', POST_FILTER, '-ar', '44100', '-codec:a', 'libmp3lame', '-qscale:a', '2', join(AUDIO_DIR, mp3)])
  rmSync(wav)
  manifest[text] = mp3
  n++
}

// --- Real animal sound effects (bundled assets; see public/CREDITS.md) ---
// Registered under keys like "sound:vacă" that the Animals game plays in place
// of speaking the onomatopoeia.
const ANIMAL_SOUND_FILES = {
  câine: 'dog',
  pisică: 'cat',
  vacă: 'cow',
  oaie: 'sheep',
  rață: 'duck',
  cal: 'horse',
  porc: 'pig',
  broască: 'frog',
  cocoș: 'rooster',
  elefant: 'elephant',
  leu: 'lion',
  bufniță: 'owl',
  lup: 'wolf',
  capră: 'goat',
  maimuță: 'monkey',
}
for (const [name, slug] of Object.entries(ANIMAL_SOUND_FILES)) {
  const src = join(HERE, 'assets', 'animals', `${slug}.mp3`)
  if (!existsSync(src)) continue
  const key = `sound:${name}`
  const mp3 = fileFor(key)
  copyFileSync(src, join(AUDIO_DIR, mp3))
  manifest[key] = mp3
  n++
}

// --- Recorded letter clips override the synthesized ones, if present ---
// Drop a real recording of each letter at scripts/assets/letters/<L>.mp3
// (see: npm run split-letters). Human recordings beat TTS for isolated letters.
for (const l of LETTERS) {
  const rec = join(HERE, 'assets', 'letters', `${l}.mp3`)
  if (!existsSync(rec)) continue
  const mp3 = fileFor(l) // same filename the synth pass used — overwrite it
  copyFileSync(rec, join(AUDIO_DIR, mp3))
  manifest[l] = mp3
}
for (const d of DIGITS) {
  const rec = join(HERE, 'assets', 'digits', `${d}.mp3`)
  if (!existsSync(rec)) continue
  const mp3 = fileFor(d)
  copyFileSync(rec, join(AUDIO_DIR, mp3))
  manifest[d] = mp3
}

// --- Instrument note clips (FluidR3_GM soundfont; see public/CREDITS.md) ---
for (const slug of ['piano', 'guitar', 'trumpet', 'violin', 'flute', 'sax', 'accordion', 'banjo', 'drum', 'bell']) {
  const src = join(HERE, 'assets', 'instruments', `${slug}.mp3`)
  if (!existsSync(src)) continue
  const key = `sound:${slug}`
  const mp3 = fileFor(key)
  copyFileSync(src, join(AUDIO_DIR, mp3))
  manifest[key] = mp3
  n++
}

const body =
  '// AUTO-GENERATED by scripts/gen-audio.mjs — do not edit by hand.\n' +
  '// Maps each spoken phrase to its bundled audio clip in public/audio/.\n' +
  `export const SPEECH: Record<string, string> = ${JSON.stringify(manifest, null, 2)}\n`
writeFileSync(MANIFEST, body)
console.log(`Rendered ${n} clips → public/audio/, wrote ${MANIFEST}`)
