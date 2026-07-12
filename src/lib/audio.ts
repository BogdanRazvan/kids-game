// Sound + Romanian speech. All triggered by taps, so the AudioContext and
// speech engine are unlocked by a user gesture as required by browsers.

let ctx: AudioContext | null = null

function ac(): AudioContext | null {
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    return (ctx ??= new Ctor())
  } catch {
    return null
  }
}

export function tone(
  freq: number,
  dur = 0.15,
  type: OscillatorType = 'sine',
  when = 0,
  gain = 0.14
): void {
  const c = ac()
  if (!c) return
  const t = c.currentTime + when
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(gain, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g)
  g.connect(c.destination)
  osc.start(t)
  osc.stop(t + dur + 0.03)
}

// A filtered burst of white noise — snares, hi-hats and cymbals.
export function noiseBurst(
  dur = 0.2,
  { gain = 0.18, hp = 0, lp = 0, when = 0 }: { gain?: number; hp?: number; lp?: number; when?: number } = {}
): void {
  const c = ac()
  if (!c) return
  const t = c.currentTime + when
  const len = Math.max(1, Math.floor(c.sampleRate * dur))
  const buf = c.createBuffer(1, len, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  src.buffer = buf
  let node: AudioNode = src
  if (hp) {
    const f = c.createBiquadFilter()
    f.type = 'highpass'
    f.frequency.value = hp
    node.connect(f)
    node = f
  }
  if (lp) {
    const f = c.createBiquadFilter()
    f.type = 'lowpass'
    f.frequency.value = lp
    node.connect(f)
    node = f
  }
  const g = c.createGain()
  g.gain.setValueAtTime(gain, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  node.connect(g)
  g.connect(c.destination)
  src.start(t)
  src.stop(t + dur + 0.02)
}

// A pitch-dropping sine — the body of a kick or tom drum.
export function boom(startF: number, endF: number, dur: number, gain = 0.28, when = 0): void {
  const c = ac()
  if (!c) return
  const t = c.currentTime + when
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(startF, t)
  o.frequency.exponentialRampToValueAtTime(Math.max(20, endF), t + dur * 0.9)
  g.gain.setValueAtTime(gain, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g)
  g.connect(c.destination)
  o.start(t)
  o.stop(t + dur + 0.03)
}

// --- Sampled instruments (realistic soundfont notes) ----------------------
const sampleCache = new Map<string, AudioBuffer>()

export async function loadSample(url: string): Promise<AudioBuffer | null> {
  const c = ac()
  if (!c) return null
  const cached = sampleCache.get(url)
  if (cached) return cached
  try {
    const res = await fetch(url)
    const arr = await res.arrayBuffer()
    const buf = await c.decodeAudioData(arr)
    sampleCache.set(url, buf)
    return buf
  } catch {
    return null
  }
}

export function getSample(url: string): AudioBuffer | undefined {
  return sampleCache.get(url)
}

export function playBuffer(buf: AudioBuffer, gain = 1, rate = 1): void {
  const c = ac()
  if (!c) return
  if (c.state === 'suspended') c.resume().catch(() => {})
  const src = c.createBufferSource()
  src.buffer = buf
  src.playbackRate.value = rate
  const g = c.createGain()
  g.gain.value = gain
  src.connect(g)
  g.connect(c.destination)
  src.start()
}

export function successChime(): void {
  tone(660, 0.12, 'sine', 0)
  tone(880, 0.14, 'sine', 0.1)
  tone(1047, 0.22, 'sine', 0.2)
}

export function celebrateChime(): void {
  ;[523, 659, 784, 1047, 1319].forEach((f, i) =>
    tone(f, 0.2, 'triangle', i * 0.12)
  )
}

export function wrongBuzz(): void {
  tone(190, 0.22, 'sawtooth', 0, 0.1)
}

export function flipTick(): void {
  tone(520, 0.06, 'square', 0, 0.07)
}

// --- Spoken instructions ---------------------------------------------------
// We prefer pre-rendered MP3 clips (see scripts/gen-audio.mjs): they play in
// every browser and offline, with no dependence on the device having a
// Romanian TTS voice. Web Speech is only a fallback for phrases without a clip.
import { SPEECH } from './speechManifest'

const AUDIO_BASE = import.meta.env.BASE_URL + 'audio/'
let current: HTMLAudioElement | null = null
let queue: string[] = []
// Fires once the queue finishes; cleared if playback is interrupted.
let doneCb: (() => void) | null = null

function stopClips(): void {
  queue = []
  doneCb = null
  if (current) {
    current.onended = null
    current.pause()
    current = null
  }
}

function playNext(): void {
  const file = queue.shift()
  if (!file) {
    current = null
    const cb = doneCb
    doneCb = null
    cb?.()
    return
  }
  const a = new Audio(AUDIO_BASE + file)
  current = a
  a.onended = () => {
    if (current === a) playNext()
  }
  // .play() can reject before the first user gesture; the very first sound is
  // always triggered inside a tap handler, so subsequent plays are unlocked.
  a.play().catch(() => {})
}

// Play one or more clips back-to-back, interrupting anything already playing.
// onDone fires when the last clip finishes (or immediately if there are none).
function playClips(files: string[], onDone?: () => void): void {
  stopClips()
  try {
    window.speechSynthesis?.cancel()
  } catch {
    /* no speech engine — fine, we're playing clips */
  }
  doneCb = onDone ?? null
  queue = files.slice()
  playNext()
}

let voice: SpeechSynthesisVoice | null = null

function loadVoice(): void {
  try {
    const voices = window.speechSynthesis.getVoices()
    voice = voices.find((v) => v.lang?.toLowerCase().startsWith('ro')) ?? null
  } catch {
    voice = null
  }
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoice()
  window.speechSynthesis.onvoiceschanged = loadVoice
}

// onDone (optional) fires when the spoken clip/utterance finishes — used by
// games that must wait for the narration before starting.
export function speak(text: string, onDone?: () => void): void {
  const clip = SPEECH[text]
  if (clip) {
    playClips([clip], onDone)
    return
  }
  // Fallback: browser text-to-speech (used only for phrases without a clip).
  try {
    const synth = window.speechSynthesis
    if (!synth) {
      onDone?.()
      return
    }
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ro-RO'
    if (voice) u.voice = voice
    u.rate = 0.95
    u.pitch = 1.1
    u.onend = () => onDone?.()
    synth.speak(u)
  } catch {
    /* speech unavailable — the visual prompt still shows */
    onDone?.()
  }
}

// Speak several phrases in a row, e.g. an instruction stem then the answer word
// ("Atinge culoarea" → "albastru"). Falls back to one joined utterance if any
// phrase lacks a clip.
export function speakSequence(texts: string[], onDone?: () => void): void {
  const files = texts.map((t) => SPEECH[t])
  if (files.every(Boolean)) {
    playClips(files as string[], onDone)
    return
  }
  speak(texts.join('. '), onDone)
}
