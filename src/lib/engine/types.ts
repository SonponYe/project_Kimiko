export type Side = 'left' | 'right';

export interface FingerZone {
  x: number;
  y: number;
  color: string;
  name: string;
  side: Side;
  localIdx: number;
  globalIdx: number;
}

export interface TouchPoint {
  x: number;
  y: number;
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

export interface Ring {
  x: number;
  y: number;
  r: number;
  life: number;
  color: string;
}

export interface DodgeObject {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  targetIdx: number;
  radius: number;
  speed: number;
  color: string;
  alive: boolean;
}

export type ScreenId = 'intro' | 'place' | 'mode-select' | 'game';

export type GameModeId = 'typing' | 'dodge' | 'memory' | 'rhythm';

export interface FlashEvent {
  text: string;
  color: string;
  id: number;
}

export interface TypedDisplayState {
  done: string;
  rest: string;
}

export interface EngineSnapshot {
  screen: ScreenId;
  fingerCount: number;
  fingerZonesLocked: boolean;
  pendingMode: GameModeId | null;
  countdown: number | null;
  mode: GameModeId | null;
  paused?: boolean;
  score: number;
  combo: number;
  typedDisplay: TypedDisplayState | null;
  promptLetter: string;
  flash: FlashEvent | null;
}
