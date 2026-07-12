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
]

type Props = { onPick: (id: GameId) => void }

export function Home({ onPick }: Props) {
  return (
    <div className="home">
      <header className="home-head">
        <h1>Joacă și Învață</h1>
      </header>
      <Section title="Alege un joc" games={[...EASY_GAMES, ...MEDIUM_GAMES]} onPick={onPick} />
      <Section title="Alege o activitate" games={FREE_GAMES} onPick={onPick} />
    </div>
  )
}

function Section({
  title,
  games,
  onPick,
}: {
  title?: string
  games: GameCard[]
  onPick: (id: GameId) => void
}) {
  return (
    <section className="section">
      {title && <h2 className="section-title">{title}</h2>}
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
