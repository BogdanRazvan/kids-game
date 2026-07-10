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

function stopClips(): void {
  queue = []
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
function playClips(files: string[]): void {
  stopClips()
  try {
    window.speechSynthesis?.cancel()
  } catch {
    /* no speech engine — fine, we're playing clips */
  }
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

export function speak(text: string): void {
  const clip = SPEECH[text]
  if (clip) {
    playClips([clip])
    return
  }
  // Fallback: browser text-to-speech (used only for phrases without a clip).
  try {
    const synth = window.speechSynthesis
    if (!synth) return
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ro-RO'
    if (voice) u.voice = voice
    u.rate = 0.95
    u.pitch = 1.1
    synth.speak(u)
  } catch {
    /* speech unavailable — the visual prompt still shows */
  }
}

// Speak several phrases in a row, e.g. an instruction stem then the answer word
// ("Atinge culoarea" → "albastru"). Falls back to one joined utterance if any
// phrase lacks a clip.
export function speakSequence(texts: string[]): void {
  const files = texts.map((t) => SPEECH[t])
  if (files.every(Boolean)) {
    playClips(files as string[])
    return
  }
  speak(texts.join('. '))
}
