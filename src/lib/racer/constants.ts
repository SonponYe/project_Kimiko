export const LANE_COUNT = 3;

export const PLAYER_Y_RATIO = 0.8;
export const PLAYER_RADIUS = 20;

export const OBSTACLE_HALF = 22;
export const ORB_RADIUS = 9;
export const HIT_BAND = 32;

export const BASE_SPEED = 240; // px/sec
export const MAX_SPEED = 560;
export const SPEED_RAMP_PER_SEC = 9;

export const BASE_SPAWN_MS = 950;
export const MIN_SPAWN_MS = 480;

export const PHASE_DURATION_MS = 1700;

export const SCORE_PER_SEC = 8;
export const ORB_SCORE = 25;

export const BEST_SCORE_KEY = 'kimiko-ghost-racer-best';

// Pure ash / grey / black, matching the rest of the app.
export const RACER_COLORS = {
  bg: '#0a0a0a',
  trail: 'rgba(10,10,10,0.82)',
  laneLine: 'rgba(228,226,223,0.08)',
  laneLineActive: 'rgba(228,226,223,0.16)',
  playerSolid: '#eae8e4',
  playerSpectral: 'rgba(228,226,223,0.32)',
  obstacle: '#48453f',
  obstacleGlow: 'rgba(228,226,223,0.12)',
  orb: '#cfcdc8',
  orbCore: '#eae8e4',
  particle: '#cfcdc8',
};
