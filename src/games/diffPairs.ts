// Real "spot the difference" pairs: two versions of the same picture with a few
// changes. Files in public/puzzles/diff/ (both cropped to the same 4:5 region so
// they align). Difference coords are normalized (0–1); r is the tap tolerance.
export type Diff = { x: number; y: number; r: number }
export type DiffPair = { a: string; b: string; diffs: Diff[] }

export const DIFF_PAIRS: DiffPair[] = [
  {
    a: '/puzzles/diff/valley_a.jpg',
    b: '/puzzles/diff/valley_b.jpg',
    diffs: [
      { x: 0.88, y: 0.37, r: 0.2 }, // green → yellow autumn tree (right)
      { x: 0.53, y: 0.78, r: 0.12 }, // boat on the river
    ],
  },
  {
    a: '/puzzles/diff/room_a.jpg',
    b: '/puzzles/diff/room_b.jpg',
    diffs: [
      { x: 0.758, y: 0.438, r: 0.11 }, // blue bird on the window
      { x: 0.164, y: 0.82, r: 0.2 }, // pink plant (bottom-left)
    ],
  },
  {
    a: '/puzzles/diff/mountains_a.jpg',
    b: '/puzzles/diff/mountains_b.jpg',
    diffs: [
      { x: 0.406, y: 0.248, r: 0.13 }, // flock of birds (top)
      { x: 0.776, y: 0.531, r: 0.1 }, // cactus on the right peak
      { x: 0.126, y: 0.82, r: 0.14 }, // rocks (bottom-left)
    ],
  },
]
