// The collectible "stickers" a child earns while playing. They live in the same
// emoji world as the games (see content.ts). Kids come back to fill the book —
// so keep this list a bit bigger than any single game session can complete.
export type Sticker = { id: string; emoji: string; name: string }

export const STICKERS: Sticker[] = [
  // Animale
  { id: 'dog', emoji: '🐶', name: 'cățel' },
  { id: 'cat', emoji: '🐱', name: 'pisică' },
  { id: 'cow', emoji: '🐮', name: 'vacă' },
  { id: 'sheep', emoji: '🐑', name: 'oaie' },
  { id: 'duck', emoji: '🦆', name: 'rață' },
  { id: 'horse', emoji: '🐴', name: 'cal' },
  { id: 'pig', emoji: '🐷', name: 'purcel' },
  { id: 'frog', emoji: '🐸', name: 'broască' },
  { id: 'lion', emoji: '🦁', name: 'leu' },
  { id: 'rabbit', emoji: '🐰', name: 'iepure' },
  { id: 'bear', emoji: '🐻', name: 'ursuleț' },
  { id: 'fox', emoji: '🦊', name: 'vulpe' },
  { id: 'bee', emoji: '🐝', name: 'albină' },
  { id: 'fish', emoji: '🐟', name: 'pește' },
  { id: 'turtle', emoji: '🐢', name: 'țestoasă' },
  { id: 'elephant', emoji: '🐘', name: 'elefant' },
  // Natură și lucruri
  { id: 'flower', emoji: '🌸', name: 'floare' },
  { id: 'sun', emoji: '☀️', name: 'soare' },
  { id: 'rainbow', emoji: '🌈', name: 'curcubeu' },
  { id: 'star', emoji: '⭐', name: 'steluță' },
  { id: 'apple', emoji: '🍎', name: 'măr' },
  { id: 'balloon', emoji: '🎈', name: 'balon' },
  { id: 'car', emoji: '🚗', name: 'mașină' },
  { id: 'rocket', emoji: '🚀', name: 'rachetă' },
]

export const STICKER_COUNT = STICKERS.length
