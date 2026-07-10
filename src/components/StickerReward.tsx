import type { Sticker } from '../data/stickers'

// The "you got a new sticker!" moment. Shown on top of the normal star burst
// when a correct answer happens to drop a fresh sticker.
export function StickerReward({ sticker }: { sticker: Sticker | null }) {
  if (!sticker) return null
  return (
    <div className="sticker-pop" aria-hidden="true">
      <div className="sticker-pop-card">
        <div className="sticker-pop-label">Autocolant nou!</div>
        <div className="sticker-pop-emoji">{sticker.emoji}</div>
        <div className="sticker-pop-name">{sticker.name}</div>
      </div>
    </div>
  )
}
