// Only index + thumb per hand — fewer, further-apart zones than a full
// five-finger spread, which gives each touch more room on a phone-sized
// screen and stays comfortably under real touchscreens' simultaneous-touch
// ceiling (many phones cap out around 5).
export const FINGERS_PER_HAND = 2;
export const DEFAULT_FINGER_COUNT = FINGERS_PER_HAND * 2;

// No hue anywhere — hands are told apart by lightness alone, both within
// the same ash/grey family: left runs a shade darker, right a shade lighter.
export const LEFT_COLORS = ['#7d7b77', '#b7b5b0'] as const;
export const RIGHT_COLORS = ['#9a9894', '#d4d2cd'] as const;

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

// Pure ash / grey / black — no hue. Positive feedback reads as brighter
// (present, alive); negative feedback reads as dimmer (fading, disappearing)
// — brightness carries the meaning that color used to.
export const CANVAS_COLORS = {
  bg: '#0a0a0a',
  trail: 'rgba(10,10,10,0.88)',
  idleFade: 'rgba(10,10,10,0.3)',
  gridLine: 'rgba(60,60,58,0.35)',
  touchDot: 'rgba(228,226,223,0.15)',
  accent: '#cfcdc8',
  accentSoft: '#eae8e4',
  danger: '#5c5a57',
  glow: '#b0aeaa',
  dim: '#7a7874',
};
