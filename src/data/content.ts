export type ColorItem = { name: string; hex: string }
export type AnimalItem = { name: string; emoji: string; sound: string }
export type ShapeItem = { name: string; kind: ShapeKind; color: string }
export type ShapeKind =
  | 'circle' | 'square' | 'triangle' | 'star' | 'heart'
  | 'rectangle' | 'oval' | 'diamond' | 'pentagon' | 'hexagon' | 'crescent'

export const COLORS: ColorItem[] = [
  { name: 'roșu', hex: '#e63946' },
  { name: 'albastru', hex: '#1d7bd6' },
  { name: 'verde', hex: '#2a9d54' },
  { name: 'galben', hex: '#f4c22b' },
  { name: 'portocaliu', hex: '#f3722c' },
  { name: 'mov', hex: '#8e44ad' },
  { name: 'roz', hex: '#f06595' },
  { name: 'maro', hex: '#8a5a2b' },
  { name: 'negru', hex: '#212529' },
  { name: 'alb', hex: '#f1f3f5' },
  { name: 'gri', hex: '#868e96' },
  { name: 'turcoaz', hex: '#0fb9b1' },
  { name: 'bej', hex: '#d4b483' },
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
  { name: 'cocoș', emoji: '🐓', sound: 'cucurigu' },
  { name: 'elefant', emoji: '🐘', sound: 'trâmbiță' },
  { name: 'leu', emoji: '🦁', sound: 'rrr' },
  { name: 'bufniță', emoji: '🦉', sound: 'hu hu' },
  { name: 'lup', emoji: '🐺', sound: 'auuu' },
  { name: 'capră', emoji: '🐐', sound: 'meee' },
  { name: 'maimuță', emoji: '🐵', sound: 'uh uh' },
]

export const SHAPES: ShapeItem[] = [
  { name: 'cerc', kind: 'circle', color: '#e63946' },
  { name: 'pătrat', kind: 'square', color: '#1d7bd6' },
  { name: 'triunghi', kind: 'triangle', color: '#2a9d54' },
  { name: 'inima', kind: 'heart', color: '#d6336c' },
  { name: 'dreptunghi', kind: 'rectangle', color: '#f59f00' },
  { name: 'oval', kind: 'oval', color: '#845ef7' },
  { name: 'romb', kind: 'diamond', color: '#0ca678' },
  { name: 'pentagon', kind: 'pentagon', color: '#1098ad' },
  { name: 'hexagon', kind: 'hexagon', color: '#e8590c' },
  { name: 'semilună', kind: 'crescent', color: '#f59f00' },
]

// The name (plural) is shown on the prompt; the child just counts what's drawn.
export type CountItem = { emoji: string; name: string }
export const COUNT_ITEMS: CountItem[] = [
  { emoji: '🍎', name: 'mere' },
  { emoji: '🦆', name: 'rațe' },
  { emoji: '🎈', name: 'baloane' },
  { emoji: '🍌', name: 'banane' },
  { emoji: '🐟', name: 'pești' },
  { emoji: '🚗', name: 'mașini' },
  { emoji: '🌸', name: 'flori' },
  { emoji: '⭐', name: 'stele' },
  { emoji: '⚽', name: 'mingi' },
  { emoji: '🐱', name: 'pisici' },
  { emoji: '🐶', name: 'cățeluși' },
  { emoji: '🐰', name: 'iepurași' },
  { emoji: '🦋', name: 'fluturi' },
  { emoji: '🍓', name: 'căpșuni' },
  { emoji: '🍊', name: 'portocale' },
  { emoji: '🍇', name: 'struguri' },
  { emoji: '🧸', name: 'ursuleți' },
  { emoji: '❤️', name: 'inimioare' },
  { emoji: '🐞', name: 'buburuze' },
  { emoji: '🍄', name: 'ciuperci' },
  { emoji: '🌟', name: 'steluțe' },
  { emoji: '🍒', name: 'cireșe' },
  { emoji: '🐤', name: 'puișori' },
  { emoji: '🚀', name: 'rachete' },
  { emoji: '🎁', name: 'cadouri' },
  { emoji: '🍭', name: 'acadele' },
  { emoji: '🐌', name: 'melci' },
  { emoji: '🍦', name: 'înghețate' },
  { emoji: '🦄', name: 'licorne' },
  { emoji: '🚂', name: 'trenuri' },
]

export const MEMORY_EMOJIS = [
  '🐶', '🐱', '🐮', '🦆', '🐸', '🦁', '🐰', '🐷',
  '🐵', '🐘', '🐯', '🐨', '🐻', '🦊', '🐼', '🐔',
  '🦋', '🐢', '🐝', '🦉', '🐧', '🦄', '🐴', '🐬',
  '🦀', '🐙', '🦖', '🐳', '🦓', '🦒', '🦝', '🦨',
  '🦫', '🦔', '🐆', '🐫', '🦙', '🐇', '🐿️', '🦜',
  '🦢', '🕊️', '🐄', '🐖',
]

// Clearly-shaped objects for the Shadows, Different, Same and More/Less games.
export const OBJECT_EMOJIS = [
  '🦋', '🐟', '🐢', '🚗', '🌳', '🍎', '⭐', '🐶',
  '🌸', '🚀', '🐘', '🦀', '⚽', '🎈', '🍌', '🐰',
  '🚲', '🌙', '☂️', '🍄', '🐝', '🎁', '🔔', '🏠',
  '🌵', '🍦', '🐧', '🎸', '🦖', '🍕', '🥕', '🦉',
  '🐬', '🚁', '🦑', '🧁', '🍉', '🐞', '🦩', '🪁',
  '🚂', '🎃', '🌂', '🏀', '🎾', '🍏', '🫖', '🧸',
  '🔑', '⚓', '🏆', '🐍', '🦔', '🚜', '🎯', '🍭',
]

// Same object shown at different sizes in the Big/Small game.
export const SIZE_EMOJIS = [
  '🐘', '🐶', '🍎', '⭐', '🚗', '🐟', '🎈', '🌳', '🐰', '🍌',
  '🦋', '🐢', '🌸', '🚀', '⚽', '🍦', '🐝', '🐧', '🦀', '🍄',
  '🐱', '🦁', '🎁', '🌵', '🍔', '🎂', '🐞', '🦖', '🏀', '🧸',
  '🌞', '🚂', '🌂', '🎃',
]

// Colourful tokens for the Patterns game.
export const PATTERN_EMOJIS = [
  '🔴', '🔵', '🟡', '🟢', '🟣', '🟠', '🟤', '⚫', '⚪',
  '❤️', '💙', '💚', '💛', '🧡', '💜', '⭐', '🌸', '🍎',
  '🟥', '🟦', '🟨', '🟩', '🟪', '🟧',
]

// The full Romanian alphabet (31 letters) for the Letters game.
export const LETTERS = [
  'A', 'Ă', 'Â', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'Î', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'Ș', 'T', 'Ț', 'U', 'V', 'W', 'X', 'Y', 'Z',
]

// Digits for the Numbers game.
export const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

// Disjoint groups for the Sorting game and the "odd one out by category" game.
export const CATEGORIES: string[][] = [
  ['🐶', '🐱', '🐮', '🐷', '🐰', '🦁', '🐸', '🐴', '🐵', '🐔', '🐘', '🐯'], // animals
  ['🍎', '🍌', '🍓', '🍇', '🍊', '🍉', '🍐', '🍒', '🍑', '🥝', '🍍', '🥭'], // fruit
  ['🚗', '🚕', '🚌', '🚓', '🚑', '🚒', '✈️', '🚀', '🚲', '🚚', '🚁', '🏍️'], // vehicles
  ['🌸', '🌼', '🌻', '🌷', '🌹', '🌵', '🌳', '🍀', '🌴', '🌲'], // plants
  ['🍕', '🍔', '🍟', '🌭', '🍩', '🍪', '🎂', '🍦', '🧁', '🍫'], // food
  ['👕', '👗', '👖', '🧥', '🧦', '🧢', '🥾', '🧤', '👔', '👟'], // clothes
  ['🐟', '🐬', '🐳', '🦈', '🐙', '🦀', '🦞', '🐚', '🦑', '🐠'], // sea
  ['🐝', '🦋', '🐛', '🐜', '🐞', '🦗', '🕷️', '🐌'], // insects
  ['⚽', '🏀', '🎾', '🏈', '⚾', '🏐', '🏓', '🥊', '🏒', '🎳'], // sports
  ['☀️', '🌧️', '⛅', '🌈', '❄️', '⚡', '🌪️', '🌙'], // weather
  ['🔨', '🪚', '🔧', '🪛', '⛏️', '🔩', '🪓', '🧰'], // tools
  ['🎸', '🎹', '🎺', '🥁', '🎻', '🪗', '🎷', '🪕'], // instruments
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
  { emoji: '🪗', slug: 'accordion' },
  { emoji: '🪕', slug: 'banjo' },
  { emoji: '🥁', slug: 'drum' },
  { emoji: '🔔', slug: 'bell' },
]

// --- Topic games (listen & tap): each item's `name` is spoken and is the answer
// key; `emoji` is what's shown. Names use the article/agreement of the prompt.
export type PickItem = { name: string; emoji: string }

// Corpul meu — "Atinge {name}"
export const BODY_PARTS: PickItem[] = [
  { name: 'nasul', emoji: '👃' },
  { name: 'urechea', emoji: '👂' },
  { name: 'ochiul', emoji: '👀' },
  { name: 'gura', emoji: '👄' },
  { name: 'mâna', emoji: '✋' },
  { name: 'piciorul', emoji: '🦶' },
  { name: 'dintele', emoji: '🦷' },
  { name: 'limba', emoji: '👅' },
]

// Emoții — "Atinge fața {name}" (feminine, agrees with "fața")
export const EMOTIONS: PickItem[] = [
  { name: 'fericită', emoji: '😀' },
  { name: 'tristă', emoji: '😢' },
  { name: 'supărată', emoji: '😠' },
  { name: 'speriată', emoji: '😨' },
  { name: 'surprinsă', emoji: '😲' },
  { name: 'somnoroasă', emoji: '😴' },
]

// Vremea & anotimpuri — "Găsește {name}"
export const WEATHER: PickItem[] = [
  { name: 'soarele', emoji: '☀️' },
  { name: 'ploaia', emoji: '🌧️' },
  { name: 'norii', emoji: '☁️' },
  { name: 'ninsoarea', emoji: '❄️' },
  { name: 'curcubeul', emoji: '🌈' },
  { name: 'furtuna', emoji: '⛈️' },
  { name: 'primăvara', emoji: '🌷' },
  { name: 'vara', emoji: '🏖️' },
  { name: 'toamna', emoji: '🍂' },
  { name: 'iarna', emoji: '⛄' },
]

// Vehicule — "Găsește {name}"
export const VEHICLES: PickItem[] = [
  { name: 'mașina', emoji: '🚗' },
  { name: 'autobuzul', emoji: '🚌' },
  { name: 'trenul', emoji: '🚂' },
  { name: 'avionul', emoji: '✈️' },
  { name: 'barca', emoji: '⛵' },
  { name: 'bicicleta', emoji: '🚲' },
  { name: 'elicopterul', emoji: '🚁' },
  { name: 'camionul', emoji: '🚚' },
  { name: 'racheta', emoji: '🚀' },
  { name: 'tractorul', emoji: '🚜' },
]

// Meserii — "Găsește {name}"
export const JOBS: PickItem[] = [
  { name: 'doctorul', emoji: '🧑‍⚕️' },
  { name: 'pompierul', emoji: '🧑‍🚒' },
  { name: 'polițistul', emoji: '👮' },
  { name: 'bucătarul', emoji: '🧑‍🍳' },
  { name: 'profesorul', emoji: '🧑‍🏫' },
  { name: 'fermierul', emoji: '🧑‍🌾' },
  { name: 'astronautul', emoji: '🧑‍🚀' },
  { name: 'pictorul', emoji: '🧑‍🎨' },
]

// Opuse — "Găsește ce e {name}"
export const OPPOSITES: PickItem[] = [
  { name: 'mare', emoji: '🐘' },
  { name: 'mic', emoji: '🐭' },
  { name: 'cald', emoji: '🔥' },
  { name: 'rece', emoji: '🧊' },
  { name: 'sus', emoji: '🔼' },
  { name: 'jos', emoji: '🔽' },
  { name: 'rapid', emoji: '🐇' },
  { name: 'încet', emoji: '🐢' },
  { name: 'vesel', emoji: '😀' },
  { name: 'trist', emoji: '😢' },
]
