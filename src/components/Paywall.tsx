import { useState } from 'react'
import { activateLicense, localUnlockHint } from '../lib/entitlement'
import { CHECKOUT_URL, PRICE_LABEL, ACTIVATION_LIMIT } from '../lib/config'

type Props = { onClose: () => void; onUnlocked: () => void }

// Shown when a child taps a locked game, or from the "unlock" affordance. Two
// paths: buy (opens the hosted checkout in a new tab) or redeem an existing key.
export function Paywall({ onClose, onUnlocked }: Props) {
  const [key, setKey] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Only set while running locally — never shown on the deployed site.
  const localCode = localUnlockHint()

  async function redeem() {
    setBusy(true)
    setError(null)
    const res = await activateLicense(key)
    setBusy(false)
    if (res.ok) {
      onUnlocked()
      return
    }
    if (res.reason === 'network')
      setError('Nu ne-am putut conecta. Verifică internetul și încearcă din nou.')
    else if (res.reason === 'limit')
      setError(`Cheia a fost folosită pe prea multe dispozitive (maxim ${ACTIVATION_LIMIT}).`)
    else setError('Cheie invalidă. Verifică și încearcă din nou.')
  }

  return (
    <div className="pw-overlay" onClick={onClose}>
      <div className="pw-modal" onClick={(e) => e.stopPropagation()}>
        <button className="pw-close" onClick={onClose} aria-label="Închide">
          ✕
        </button>

        <div className="pw-emoji">🔒</div>
        <h2 className="pw-title">Deblochează toate jocurile</h2>
        <p className="pw-sub">
          O singură plată, pentru totdeauna. Peste 30 de jocuri și activități,
          toate temele, fără reclame.
        </p>

        <a
          className="pw-buy"
          href={CHECKOUT_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Cumpără — {PRICE_LABEL}
        </a>

        <div className="pw-divider">
          <span>ai deja o cheie?</span>
        </div>

        <div className="pw-redeem">
          <input
            className="pw-input"
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="Introdu cheia"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            disabled={busy}
          />
          <button
            className="pw-redeem-btn"
            onClick={redeem}
            disabled={busy || key.trim().length === 0}
          >
            {busy ? '...' : 'Activează'}
          </button>
        </div>

        {error && <p className="pw-error">{error}</p>}

        <p className="pw-note">
          Cheia îți este trimisă pe e-mail după cumpărare. O poți folosi pe orice
          dispozitiv al tău.
        </p>

        {localCode && (
          <button className="pw-localcode" onClick={() => setKey(localCode)}>
            cod local: <code>{localCode}</code>
          </button>
        )}
      </div>
    </div>
  )
}
