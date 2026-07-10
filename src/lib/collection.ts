// The child's sticker collection — persisted to localStorage so the book is
// still there next time the tablet comes out. That persistence is the whole
// point of the feature: it's the reason to come back.
import { useSyncExternalStore } from 'react'
import { STICKERS, Sticker } from '../data/stickers'
import { pick } from './game'

const KEY = 'joaca.collection.v1'

let collected: Set<string> = load()
const listeners = new Set<() => void>()

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    const ids: unknown = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(ids) ? ids.filter((x) => typeof x === 'string') : [])
  } catch {
    return new Set()
  }
}

function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([...collected]))
  } catch {
    /* storage unavailable (private mode, quota) — collection just won't persist */
  }
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

// New Set reference on every change so useSyncExternalStore re-renders.
function getSnapshot(): Set<string> {
  return collected
}

/**
 * Award a sticker the child does NOT already have. Returns the new sticker, or
 * null when the book is already full (so callers can fall back to a plain
 * celebration). Earning only-new stickers keeps every drop a real surprise.
 */
export function earnNewSticker(): Sticker | null {
  const remaining = STICKERS.filter((s) => !collected.has(s.id))
  if (remaining.length === 0) return null
  const sticker = pick(remaining)
  collected = new Set(collected)
  collected.add(sticker.id)
  save()
  listeners.forEach((l) => l())
  return sticker
}

/** React hook: the set of collected sticker ids, reactive to earning. */
export function useCollected(): Set<string> {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
