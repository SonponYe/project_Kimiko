export type ScreenId = 'intro' | 'game' | 'gameover';

export type Phase = 'solid' | 'spectral';

export interface Obstacle {
  id: number;
  lane: number;
  y: number;
  passed: boolean;
}

export interface Orb {
  id: number;
  lane: number;
  y: number;
  taken: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
  color: string;
}

export interface RacerSnapshot {
  screen: ScreenId;
  score: number;
  best: number;
  phase: Phase;
  phaseProgress: number; // 0-1, time left in current phase
}
