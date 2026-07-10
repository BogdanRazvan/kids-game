import { TopBar } from './TopBar'
import { STICKERS } from '../data/stickers'
import { useCollected } from '../lib/collection'
import { speak } from '../lib/audio'

// "Colecția mea" — the book the child fills up. Collected stickers show in full
// colour; the rest are silhouettes, so there's always a visible gap to close.
export function Collection({ onBack }: { onBack: () => void }) {
  const collected = useCollected()
  const have = STICKERS.filter((s) => collected.has(s.id)).length

  return (
    <div className="game">
      <TopBar
        title="Colecția mea"
        onBack={onBack}
        total={STICKERS.length}
        index={have}
        onReplay={() => speak(`Colecția mea. ${have} din ${STICKERS.length}.`)}
      />
      <div className="collection-body">
        <p className="collection-count">
          {have} din {STICKERS.length}
        </p>
        <div className="sticker-grid">
          {STICKERS.map((s) => {
            const owned = collected.has(s.id)
            return (
              <button
                key={s.id}
                className={'sticker-slot' + (owned ? ' owned' : '')}
                onClick={() => owned && speak(s.name)}
                aria-label={owned ? s.name : 'autocolant nedescoperit'}
              >
                <span className="sticker-slot-emoji">{owned ? s.emoji : '❓'}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
