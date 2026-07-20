// ─────────────────────────────────────────────────────────────────────────────
// Freemium entitlement: which games are free, whether the full set is unlocked,
// and activating/validating a Lemon Squeezy license key.
//
// The unlock state lives in localStorage so it survives reloads and works fully
// offline. A user "comes back" on a new device by re-entering the same key,
// which re-activates against Lemon Squeezy (up to ACTIVATION_LIMIT devices).
// ─────────────────────────────────────────────────────────────────────────────
import { useSyncExternalStore } from 'react'
import type { GameId } from '../App'
import { PAYWALL_ENABLED, ACTIVATION_LIMIT, LOCAL_UNLOCK_CODE } from './config'

// The free teaser: core learning basics + a couple of open-ended toys. Everything
// NOT in this set requires the one-time unlock.
export const FREE_GAMES: ReadonlySet<GameId> = new Set<GameId>([
  'colors',
  'counting',
  'shapes',
  'animals',
  'memory',
  'letters',
  'digits',
  'bubbles',
  'coloring',
])

export function isFree(id: GameId): boolean {
  return FREE_GAMES.has(id)
}

const KEY_STORAGE = 'ji_license_key'
const UNLOCK_STORAGE = 'ji_unlocked'
const INSTANCE_STORAGE = 'ji_instance_name'

// ── unlock state (observable, so React re-renders when it flips) ──────────────
const listeners = new Set<() => void>()
function emit() {
  for (const l of listeners) l()
}

export function isUnlocked(): boolean {
  if (!PAYWALL_ENABLED) return true
  try {
    return localStorage.getItem(UNLOCK_STORAGE) === '1'
  } catch {
    return false
  }
}

function setUnlocked(key: string) {
  try {
    localStorage.setItem(UNLOCK_STORAGE, '1')
    localStorage.setItem(KEY_STORAGE, key)
  } catch {
    /* private-mode / storage disabled: unlock holds for this session only */
  }
  emit()
}

export function savedLicenseKey(): string {
  try {
    return localStorage.getItem(KEY_STORAGE) ?? ''
  } catch {
    return ''
  }
}

/** Clears the local unlock (for a "sign out" / "not you?" affordance). */
export function clearUnlock() {
  try {
    localStorage.removeItem(UNLOCK_STORAGE)
    localStorage.removeItem(KEY_STORAGE)
  } catch {
    /* ignore */
  }
  emit()
}

// React hook: components call this and re-render whenever the unlock flips.
export function useUnlocked(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    isUnlocked,
    isUnlocked,
  )
}

// ── access decision ───────────────────────────────────────────────────────────
export function canPlay(id: GameId): boolean {
  return isFree(id) || isUnlocked()
}

// ── local unlock code ─────────────────────────────────────────────────────────
// True when the app is being served from this machine or your own network: the
// Vite dev server, localhost (`npm run preview`), or a private LAN address (so
// testing on a tablet via `--host` counts). The deployed site is never "local",
// so LOCAL_UNLOCK_CODE can't be used there even though it ships in the bundle.
function isLocal(): boolean {
  try {
    // A Capacitor/native build also serves from localhost — don't treat that as
    // local, or a shipped app would happily accept the code.
    if (typeof window !== 'undefined' && 'Capacitor' in window) return false
    if (location.protocol === 'capacitor:' || location.protocol === 'file:') return false
    if (import.meta.env.DEV) return true
    const h = location.hostname
    if (h === 'localhost' || h === '127.0.0.1' || h === '::1' || h.endsWith('.local')) return true
    // Private LAN ranges (RFC 1918).
    return (
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(h) ||
      /^192\.168\.\d{1,3}\.\d{1,3}$/.test(h) ||
      /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(h)
    )
  } catch {
    return false
  }
}

/** The local unlock code, but only while running locally — otherwise null. Used
 *  to show a hint on the unlock screen so you don't have to remember it. */
export function localUnlockHint(): string | null {
  const code = LOCAL_UNLOCK_CODE.trim()
  return code && isLocal() ? code : null
}

/** Does this input match the local unlock code (and are we allowed to use it)? */
function isLocalUnlockCode(key: string): boolean {
  const code = LOCAL_UNLOCK_CODE.trim()
  if (!code || !isLocal()) return false
  return key.trim().toUpperCase() === code.toUpperCase()
}

// ── Lemon Squeezy license activation ──────────────────────────────────────────
// These endpoints are designed to be called from a client and do NOT require the
// store's secret API key, so they work from this fully-static site.
const LS_ACTIVATE = 'https://api.lemonsqueezy.com/v1/licenses/activate'

function instanceName(): string {
  try {
    let name = localStorage.getItem(INSTANCE_STORAGE)
    if (!name) {
      const rnd =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID().slice(0, 8)
          : Math.random().toString(36).slice(2, 10)
      name = `web-${rnd}`
      localStorage.setItem(INSTANCE_STORAGE, name)
    }
    return name
  } catch {
    return 'web'
  }
}

export type ActivateResult =
  | { ok: true }
  | { ok: false; reason: 'invalid' | 'limit' | 'network' }

/**
 * Validate + activate a license key. On success, unlocks the full app.
 * Trims whitespace so a pasted key with stray spaces still works.
 */
export async function activateLicense(rawKey: string): Promise<ActivateResult> {
  const key = rawKey.trim()
  if (!key) return { ok: false, reason: 'invalid' }

  // The local code unlocks immediately — no network, no Lemon Squeezy. Ignored
  // unless the app is served locally, so it does nothing on the deployed site.
  if (isLocalUnlockCode(key)) {
    setUnlocked(key)
    return { ok: true }
  }

  let res: Response
  try {
    const body = new URLSearchParams({
      license_key: key,
      instance_name: instanceName(),
    })
    res = await fetch(LS_ACTIVATE, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body,
    })
  } catch {
    return { ok: false, reason: 'network' }
  }

  let data: {
    activated?: boolean
    error?: string | null
    license_key?: { status?: string; activation_usage?: number; activation_limit?: number }
  }
  try {
    data = await res.json()
  } catch {
    return { ok: false, reason: 'network' }
  }

  if (data.activated) {
    setUnlocked(key)
    return { ok: true }
  }

  // Already activated on this-or-another device but the key itself is valid and
  // active: treat as unlocked (the buyer is returning). Lemon Squeezy reports the
  // key status even when activation is refused for hitting the device limit.
  const status = data.license_key?.status
  const usage = data.license_key?.activation_usage ?? 0
  const limit = data.license_key?.activation_limit ?? ACTIVATION_LIMIT
  if (status === 'active' && usage <= limit) {
    setUnlocked(key)
    return { ok: true }
  }

  const err = (data.error ?? '').toLowerCase()
  if (err.includes('activation limit') || status === 'active') {
    return { ok: false, reason: 'limit' }
  }
  return { ok: false, reason: 'invalid' }
}
