import { speak } from '../lib/audio'
import { useCollected } from '../lib/collection'
import { STICKERS } from '../data/stickers'
import type { GameId } from '../App'

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
]

const MEDIUM_GAMES: GameCard[] = [
  { id: 'spot', title: 'Diferențe', emoji: '🔎', color: '#e8348c' },
  { id: 'puzzle', title: 'Puzzle', emoji: '🖼️', color: '#1c7ed6' },
]

type Props = { onPick: (id: GameId) => void; onOpenBook: () => void }

export function Home({ onPick, onOpenBook }: Props) {
  const collected = useCollected()
  const have = STICKERS.filter((s) => collected.has(s.id)).length

  return (
    <div className="home">
      <header className="home-head">
        <h1>Joacă și Învață</h1>
        <p>Alege un joc</p>
      </header>
      <button
        className="book-banner"
        onClick={() => {
          speak('Colecția mea')
          onOpenBook()
        }}
      >
        <span className="book-banner-emoji">🏅</span>
        <span className="book-banner-text">Colecția mea</span>
        <span className="book-banner-count">
          {have}/{STICKERS.length}
        </span>
      </button>
      <Section title="Jocuri ușoare" games={EASY_GAMES} onPick={onPick} />
      <Section title="Jocuri medii" games={MEDIUM_GAMES} onPick={onPick} />
    </div>
  )
}

function Section({
  title,
  games,
  onPick,
}: {
  title: string
  games: GameCard[]
  onPick: (id: GameId) => void
}) {
  return (
    <section className="section">
      <h2 className="section-title">{title}</h2>
      <div className="grid">
        {games.map((g) => (
          <button
            key={g.id}
            className="card"
            style={{ ['--c' as string]: g.color } as React.CSSProperties}
            onClick={() => onPick(g.id)}
          >
            <span className="card-emoji">{g.emoji}</span>
            <span className="card-title">{g.title}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
