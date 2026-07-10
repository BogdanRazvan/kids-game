import { useEffect } from 'react'
import { celebrateChime, speak } from '../lib/audio'

type Props = {
  onAgain: () => void
  onHome: () => void
  // When present, a "Continuă" button advances to the next, harder level.
  onContinue?: () => void
  level: number // 1-based level just completed
  maxLevel: number
}

export function DoneScreen({ onAgain, onHome, onContinue, level, maxLevel }: Props) {
  useEffect(() => {
    celebrateChime()
    speak('Bravo! Ai reușit!')
  }, [])

  return (
    <div className="done">
      <div className="done-emoji">🎉</div>
      <h2>Bravo!</h2>
      <div className="level-pips" aria-label={`Nivel ${level} din ${maxLevel}`}>
        {Array.from({ length: maxLevel }).map((_, i) => (
          <span key={i} className={'level-pip' + (i < level ? ' on' : '')} />
        ))}
      </div>
      <div className="done-actions">
        {onContinue && (
          <button className="btn primary" onClick={onContinue}>
            Mai departe ➜
          </button>
        )}
        <button className={'btn' + (onContinue ? '' : ' primary')} onClick={onAgain}>
          Din nou
        </button>
        <button className="btn" onClick={onHome}>
          Acasă
        </button>
      </div>
    </div>
  )
}
