// Only index + thumb per hand — fewer, further-apart zones than a full
// five-finger spread, which gives each touch more room on a phone-sized
// screen and stays comfortably under real touchscreens' simultaneous-touch
// ceiling (many phones cap out around 5).
export const FINGERS_PER_HAND = 2;
export const DEFAULT_FINGER_COUNT = FINGERS_PER_HAND * 2;

// Both hands stay within the same airy blue-black family: left runs a shade
// deeper/cooler, right a shade lighter/airier, so the two sides read as
// related rather than clashing accent colors.
export const LEFT_COLORS = ['#5b86e0', '#b9cdf7'] as const;
export const RIGHT_COLORS = ['#6fa8ff', '#d3ebff'] as const;

export const FINGER_NAMES = ['index', 'thumb'] as const;

// Left hand: index, thumb (indices 0-1). Right hand: thumb, index (indices
// 2-3) — the four letters flanking the keyboard's own center gap, F G | H J,
// read left to right exactly like the two hands converging on screen.
export const LETTER_MAP: Record<number, string> = {
  0: 'F',
  1: 'G',
  2: 'H',
  3: 'J',
};

export const WORDS = ['FGHJ', 'JHGF', 'GFJH', 'HJGF', 'FJHG', 'GHJF', 'JFHG', 'HGFJ'];

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
