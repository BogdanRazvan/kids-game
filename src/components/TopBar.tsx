type Props = {
  title: string
  onBack: () => void
  total: number
  index: number
  onReplay?: () => void
  hideTitle?: boolean
}

export function TopBar({ title, onBack, total, index, onReplay, hideTitle }: Props) {
  return (
    <header className="topbar">
      <button className="back" onClick={onBack} aria-label="Înapoi acasă">
        ⬅
      </button>
      {onReplay && (
        <button className="replay" onClick={onReplay} aria-label="Ascultă din nou">
          🔊
        </button>
      )}
      {hideTitle ? (
        <div className="topbar-spacer" />
      ) : (
        <h1 className="game-title">{title}</h1>
      )}
      <div className="progress" aria-label={`Runda ${Math.min(index + 1, total)} din ${total}`}>
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={'dot' + (i < index ? ' on' : '')} />
        ))}
      </div>
    </header>
  )
}
