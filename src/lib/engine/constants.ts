// Both hands stay within the same airy blue-black family: left runs a shade
// deeper/cooler, right a shade lighter/airier, so the two sides read as
// related rather than clashing accent colors.
export const LEFT_COLORS = ['#5b86e0', '#6f95e6', '#84a5ec', '#9bb6f1', '#b9cdf7'] as const;
export const RIGHT_COLORS = ['#6fa8ff', '#82b7ff', '#9ac6ff', '#b6d8ff', '#d3ebff'] as const;

export const FINGER_NAMES = ['pinky', 'ring', 'middle', 'index', 'thumb'] as const;

// Left hand (indices 0-4): pinky to thumb. Right hand (indices 5-9): thumb to pinky.
export const LETTER_MAP: Record<number, string> = {
  0: 'A',
  1: 'S',
  2: 'D',
  3: 'F',
  4: 'G',
  5: 'H',
  6: 'J',
  7: 'K',
  8: 'L',
  9: ';',
};

export const WORDS = ['FLASH', 'SKILL', 'HANDS', 'QUILL', 'PIANO', 'DRIFT', 'BLISS', 'CRANK', 'SWOOP', 'FROST'];

export const CANVAS_COLORS = {
  bg: '#06090d',
  trail: 'rgba(6,9,13,0.88)',
  idleFade: 'rgba(6,9,13,0.3)',
  gridLine: 'rgba(40,52,68,0.35)',
  touchDot: 'rgba(219,227,234,0.15)',
  accent: '#6fa8ff',
  accentSoft: '#a9cdfb',
  danger: '#d1555c',
  glow: '#8fe0e8',
  dim: '#8993a1',
};
