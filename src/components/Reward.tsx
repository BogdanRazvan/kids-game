import { useEffect } from 'react'
import { successChime } from '../lib/audio'

const STARS = ['⭐', '✨', '🌟', '⭐', '✨', '🌟', '⭐', '✨', '🌟']

export function Reward({ show }: { show: boolean }) {
  useEffect(() => {
    if (show) successChime()
  }, [show])

  if (!show) return null

  return (
    <div className="reward" aria-hidden="true">
      {STARS.map((s, i) => (
        <span
          key={i}
          className="reward-star"
          style={{ ['--i' as string]: i } as React.CSSProperties}
        >
          {s}
        </span>
      ))}
      <div className="reward-big">⭐</div>
    </div>
  )
}
