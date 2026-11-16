export type ScreenId = 'intro' | 'game' | 'gameover';

export type Phase = 'solid' | 'spectral';

export type PowerKind = 'shield' | 'magnet' | 'slow' | 'double';

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
  /** 0-1: how far the orb has been pulled sideways toward the player (magnet). */
  pull: number;
}

export interface Pickup {
  id: number;
  lane: number;
  y: number;
  kind: PowerKind;
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

export interface Popup {
  x: number;
  y: number;
  text: string;
  life: number;
}

/** Discrete UI state. Only emitted when something the UI shows actually changes. */
export interface RacerSnapshot {
  screen: ScreenId;
  paused: boolean;
  score: number;
  best: number;
  newBest: boolean;
  phase: Phase;
  powerups: PowerKind[];
}

/** Continuous values, polled by the HUD from its own animation frame. */
export interface RacerLive {
  phaseProgress: number; // 1 -> 0 across the current phase
  phaseWarning: boolean; // phase is about to flip
  powerFill: Record<PowerKind, number>; // 0-1 remaining
}
