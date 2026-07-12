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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12 H7" />
          <path d="M12 7 L7 12 L12 17" />
        </svg>
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
