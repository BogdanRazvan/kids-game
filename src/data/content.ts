export type ColorItem = { name: string; hex: string }
export type AnimalItem = { name: string; emoji: string; sound: string }
export type ShapeItem = { name: string; kind: ShapeKind; color: string }
export type ShapeKind = 'circle' | 'square' | 'triangle' | 'star' | 'heart'

export const COLORS: ColorItem[] = [
  { name: 'roșu', hex: '#e63946' },
  { name: 'albastru', hex: '#1d7bd6' },
  { name: 'verde', hex: '#2a9d54' },
  { name: 'galben', hex: '#f4c22b' },
  { name: 'portocaliu', hex: '#f3722c' },
  { name: 'mov', hex: '#8e44ad' },
]

export const ANIMALS: AnimalItem[] = [
  { name: 'câine', emoji: '🐶', sound: 'ham ham' },
  { name: 'pisică', emoji: '🐱', sound: 'miau' },
  { name: 'vacă', emoji: '🐮', sound: 'muu' },
  { name: 'oaie', emoji: '🐑', sound: 'beee' },
  { name: 'rață', emoji: '🦆', sound: 'mac mac' },
  { name: 'cal', emoji: '🐴', sound: 'ihaha' },
  { name: 'porc', emoji: '🐷', sound: 'guiț guiț' },
  { name: 'broască', emoji: '🐸', sound: 'oac oac' },
]

export const SHAPES: ShapeItem[] = [
  { name: 'cerc', kind: 'circle', color: '#e63946' },
  { name: 'pătrat', kind: 'square', color: '#1d7bd6' },
  { name: 'triunghi', kind: 'triangle', color: '#2a9d54' },
  { name: 'inima', kind: 'heart', color: '#d6336c' },
]

// `name` is the plural, spoken as "Atinge numărul <name>".
export type CountItem = { emoji: string; name: string }
export const COUNT_ITEMS: CountItem[] = [
  { emoji: '🍎', name: 'mere' },
  { emoji: '🦆', name: 'rațe' },
  { emoji: '🎈', name: 'baloane' },
  { emoji: '🍌', name: 'banane' },
  { emoji: '🐟', name: 'pești' },
  { emoji: '🚗', name: 'mașini' },
]

export const MEMORY_EMOJIS = ['🐶', '🐱', '🐮', '🦆', '🐸', '🦁', '🐰', '🐷']

// Clearly-shaped objects for the Shadows and "Odd one out" games.
export const OBJECT_EMOJIS = [
  '🦋', '🐟', '🐢', '🚗', '🌳', '🍎', '⭐', '🐶',
  '🌸', '🚀', '🐘', '🦀', '⚽', '🎈', '🍌', '🐰',
]

// Same object shown at different sizes in the Big/Small game.
export const SIZE_EMOJIS = ['🐘', '🐶', '🍎', '⭐', '🚗', '🐟', '🎈', '🌳', '🐰', '🍌']

// Colourful tokens for the Patterns game.
export const PATTERN_EMOJIS = ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠', '⭐', '❤️', '🍎', '🐶']

// The full Romanian alphabet (31 letters) for the Letters game.
export const LETTERS = [
  'A', 'Ă', 'Â', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'Î', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'Ș', 'T', 'Ț', 'U', 'V', 'W', 'X', 'Y', 'Z',
]

// Digits for the Numbers game.
export const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

// Disjoint groups for the "odd one out by category" game.
export const CATEGORIES: string[][] = [
  ['🐶', '🐱', '🐮', '🐷', '🐰', '🦁', '🐸', '🐴'], // animals
  ['🍎', '🍌', '🍓', '🍇', '🍊', '🍉', '🍐', '🍒'], // fruit
  ['🚗', '🚕', '🚌', '🚓', '🚑', '🚒', '✈️', '🚀'], // vehicles
  ['🌸', '🌼', '🌻', '🌷', '🌹', '🌵'], // plants
]

// Musical instruments for the Music game (each plays a real sound clip).
export type InstrumentItem = { emoji: string; slug: string }
export const INSTRUMENTS: InstrumentItem[] = [
  { emoji: '🎹', slug: 'piano' },
  { emoji: '🎸', slug: 'guitar' },
  { emoji: '🎺', slug: 'trumpet' },
  { emoji: '🎻', slug: 'violin' },
  { emoji: '🪈', slug: 'flute' },
  { emoji: '🎷', slug: 'sax' },
]
