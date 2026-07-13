// Real "spot the difference" pairs: two versions of the same picture with a few
// changes. Files in public/puzzles/diff/ (both cropped to the same 4:5 region so
// they align). Difference coords are normalized (0–1); r is the tap tolerance.
// r is the horizontal tap radius; ry (optional) is the vertical radius, making
// the hit region a tall/wide ellipse instead of a circle. Defaults to r.
export type Diff = { x: number; y: number; r: number; ry?: number }
export type DiffPair = { a: string; b: string; diffs: Diff[] }

export const DIFF_PAIRS: DiffPair[] = [
  {
    a: '/puzzles/diff/valley_a.jpg',
    b: '/puzzles/diff/valley_b.jpg',
    diffs: [
      { x: 0.87, y: 0.31, r: 0.15, ry: 0.35 }, // green → yellow autumn tree (tall, right edge)
      { x: 0.53, y: 0.78, r: 0.12 }, // boat on the river
      { x: 0.12, y: 0.85, r: 0.17 }, // blue → red flowers (bottom-left)
      { x: 0.24, y: 0.1, r: 0.15 }, // birds (top-left)
    ],
  },
  {
    a: '/puzzles/diff/room_a.jpg',
    b: '/puzzles/diff/room_b.jpg',
    diffs: [
      { x: 0.758, y: 0.438, r: 0.11 }, // blue bird on the window
      { x: 0.164, y: 0.82, r: 0.2 }, // pink plant (bottom-left)
      { x: 0.404, y: 0.763, r: 0.1 }, // green pillow on the couch
      { x: 0.123, y: 0.46, r: 0.09, ry: 0.18 }, // purple plant + the flower just below (tall)
    ],
  },
  {
    a: '/puzzles/diff/mountains_a.jpg',
    b: '/puzzles/diff/mountains_b.jpg',
    diffs: [
      { x: 0.406, y: 0.248, r: 0.13 }, // flock of birds (top): 5 on the left, 2 on the right
      { x: 0.76, y: 0.5, r: 0.11 }, // cactus standing over the sun
    ],
  },
  {
    a: '/puzzles/diff/hedgehogs_a.jpg',
    b: '/puzzles/diff/hedgehogs_b.jpg',
    diffs: [
      { x: 0.16, y: 0.31, r: 0.09 }, // blue flower added (right, in the flower band)
      { x: 0.375, y: 0.55, r: 0.08 }, // little heart (left only)
      { x: 0.37, y: 0.79, r: 0.11 }, // blanket: red (left) → yellow (right)
    ],
  },
]
