import { useState } from 'react'
import type { GameId } from '../App'
import { isFree, useUnlocked } from '../lib/entitlement'
import { PAYWALL_ENABLED, PRICE_LABEL } from '../lib/config'
import { Paywall } from './Paywall'

type GameCard = { id: GameId; title: string; emoji: string; color: string }

const EASY_GAMES: GameCard[] = [
  { id: 'colors', title: 'Culori', emoji: '🎨', color: '#e63946' },
  { id: 'counting', title: 'Numărăm', emoji: '🔢', color: '#1d7bd6' },
  { id: 'shapes', title: 'Forme', emoji: '🔺', color: '#2a9d54' },
  { id: 'animals', title: 'Animale', emoji: '🐮', color: '#f3722c' },
  { id: 'memory', title: 'Memorie', emoji: '🧠', color: '#8e44ad' },
  { id: 'shadows', title: 'Umbre', emoji: '🌑', color: '#495057' },
  { id: 'sizes', title: 'Mărime', emoji: '📏', color: '#0ca678' },
  { id: 'different', title: 'Diferit', emoji: '🔍', color: '#e8590c' },
  { id: 'patterns', title: 'Modele', emoji: '🧩', color: '#7048e8' },
  { id: 'same', title: 'La fel', emoji: '🟰', color: '#1098ad' },
  { id: 'letters', title: 'Litere', emoji: '🔤', color: '#d6336c' },
  { id: 'digits', title: 'Cifre', emoji: '🔟', color: '#f08c00' },
  { id: 'moreless', title: 'Mai mult', emoji: '⚖️', color: '#37b24d' },
  { id: 'odd', title: 'Intrusul', emoji: '🕵️', color: '#6741d9' },
  { id: 'music', title: 'Muzică', emoji: '🎸', color: '#c2255c' },
  { id: 'body', title: 'Corpul meu', emoji: '👃', color: '#e64980' },
  { id: 'emotions', title: 'Emoții', emoji: '😀', color: '#f59f00' },
  { id: 'weather', title: 'Vremea', emoji: '☀️', color: '#4dabf7' },
  { id: 'vehicles', title: 'Vehicule', emoji: '🚗', color: '#e8590c' },
  { id: 'jobs', title: 'Meserii', emoji: '🧑‍🚒', color: '#0ca678' },
  { id: 'opposites', title: 'Opuse', emoji: '↔️', color: '#7048e8' },
]

const MEDIUM_GAMES: GameCard[] = [
  { id: 'spot', title: 'Diferențe', emoji: '🔎', color: '#e8348c' },
  { id: 'puzzle', title: 'Puzzle', emoji: '🖼️', color: '#1c7ed6' },
  { id: 'addition', title: 'Adunare', emoji: '➕', color: '#f03e3e' },
  { id: 'ordersize', title: 'Ordonează', emoji: '📊', color: '#0ca678' },
  { id: 'sorting', title: 'Sortare', emoji: '🗂️', color: '#f76707' },
  { id: 'maze', title: 'Labirint', emoji: '🐭', color: '#d6336c' },
  { id: 'missingnumber', title: 'Numere lipsă', emoji: '🧮', color: '#1098ad' },
  { id: 'dots', title: 'Unește punctele', emoji: '✨', color: '#e8590c' },
  { id: 'food', title: 'Hrană', emoji: '🍽️', color: '#66a80f' },
  { id: 'remember', title: 'Ține minte', emoji: '💡', color: '#7048e8' },
]

// Open-ended, no-fail free play for the littlest kids.
const FREE_GAMES: GameCard[] = [
  { id: 'coloring', title: 'Colorează', emoji: '🖍️', color: '#e8348c' },
  { id: 'paint', title: 'Pictează', emoji: '🖌️', color: '#1c7ed6' },
  { id: 'bubbles', title: 'Bule', emoji: '🫧', color: '#22b8cf' },
  { id: 'instruments', title: 'Instrumente', emoji: '🎵', color: '#f76707' },
  { id: 'fireworks', title: 'Artificii', emoji: '🎆', color: '#7048e8' },
  { id: 'stamps', title: 'Ștampile', emoji: '🌟', color: '#f59f00' },
  { id: 'sparkle', title: 'Baghetă magică', emoji: '✨', color: '#e64980' },
  { id: 'garden', title: 'Grădina', emoji: '🌼', color: '#37b24d' },
  { id: 'aquarium', title: 'Acvariu', emoji: '🐠', color: '#0ca678' },
  { id: 'spinner', title: 'Morișcă', emoji: '🌀', color: '#1c7ed6' },
]

type Props = { onPick: (id: GameId) => void }

export function Home({ onPick }: Props) {
  const unlocked = useUnlocked()
  const [showPaywall, setShowPaywall] = useState(false)
  const gated = PAYWALL_ENABLED && !unlocked

  // Locked games open the paywall instead of the game; free games play as usual.
  const handlePick = (id: GameId) => {
    if (gated && !isFree(id)) setShowPaywall(true)
    else onPick(id)
  }

  return (
    <div className="home">
      <header className="home-head">
        <h1>Joacă și Învață</h1>
      </header>
      {gated && (
        <button className="unlock-banner" onClick={() => setShowPaywall(true)}>
          <span className="ub-emoji">🎁</span>
          <span className="ub-text">
            <span className="ub-title">Deblochează tot. </span>
            <span className="ub-sub">Peste 30 de jocuri, toate temele, fără reclame</span>
          </span>
          <span className="ub-price">{PRICE_LABEL}</span>
        </button>
      )}
      <Section
        title="Alege un joc"
        games={[...EASY_GAMES, ...MEDIUM_GAMES]}
        onPick={handlePick}
        gated={gated}
      />
      <Section
        title="Alege o activitate"
        games={FREE_GAMES}
        onPick={handlePick}
        gated={gated}
      />
      {showPaywall && (
        <Paywall
          onClose={() => setShowPaywall(false)}
          onUnlocked={() => setShowPaywall(false)}
        />
      )}
    </div>
  )
}

function Section({
  title,
  games,
  onPick,
  gated,
}: {
  title?: string
  games: GameCard[]
  onPick: (id: GameId) => void
  gated: boolean
}) {
  return (
    <section className="section">
      {title && <h2 className="section-title">{title}</h2>}
      <div className="grid">
        {games.map((g) => {
          const locked = gated && !isFree(g.id)
          return (
            <button
              key={g.id}
              className={locked ? 'card locked' : 'card'}
              style={{ ['--c' as string]: g.color } as React.CSSProperties}
              onClick={() => onPick(g.id)}
            >
              {locked && (
                <span className="lock-badge" aria-hidden="true">
                  🔒
                </span>
              )}
              <span className="card-emoji">{g.emoji}</span>
              <span className="card-title">{g.title}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
