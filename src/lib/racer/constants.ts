import type { PowerKind } from './types';

export const LANE_COUNT = 3;

export const PLAYER_Y_RATIO = 0.8;
export const PLAYER_RADIUS = 20;

export const OBSTACLE_HALF = 22;
export const ORB_RADIUS = 9;
export const PICKUP_RADIUS = 15;
export const HIT_BAND = 32;

export const BASE_SPEED = 240; // px/sec
export const MAX_SPEED = 560;
export const SPEED_RAMP_PER_SEC = 9;

export const BASE_SPAWN_MS = 950;
export const MIN_SPAWN_MS = 480;
/** Seconds before two-obstacle rows (one lane always left open) can appear. */
export const DOUBLE_ROW_AFTER_S = 12;

export const PHASE_DURATION_MS = 1700;
export const PHASE_WARNING_MS = 380;

export const SCORE_PER_SEC = 8;
export const ORB_SCORE = 25;
export const PICKUP_SCORE = 50;

// Power-ups
export const POWER_DURATION_MS: Record<Exclude<PowerKind, 'shield'>, number> = {
  magnet: 7000,
  slow: 5000,
  double: 8000,
};
export const POWER_LABEL: Record<PowerKind, string> = {
  shield: 'Shield',
  magnet: 'Magnet',
  slow: 'Slow',
  double: '×2',
};
export const SLOW_SCALE = 0.55;
export const SHIELD_GRACE_S = 1.1;
export const MAGNET_RANGE = 340; // px above the player where orbs start to pull
export const FIRST_PICKUP_MS = 7000;
export const PICKUP_GAP_MS: [number, number] = [9000, 15000];

export const DEATH_DELAY_MS = 750;

export const BEST_SCORE_KEY = 'kimiko-ghost-racer-best';

// Pure ash / grey / black, matching the rest of the app.
export const RACER_COLORS = {
  bg: '#0a0a0a',
  trail: 'rgba(10,10,10,0.82)',
  laneLine: 'rgba(228,226,223,0.08)',
  playerSolid: '#eae8e4',
  playerSpectral: 'rgba(228,226,223,0.32)',
  obstacle: '#48453f',
  obstacleGlow: 'rgba(228,226,223,0.12)',
  orb: '#cfcdc8',
  orbCore: '#eae8e4',
  particle: '#cfcdc8',
};
