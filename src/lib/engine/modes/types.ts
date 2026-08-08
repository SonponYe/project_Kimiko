import type { KimikoEngine } from '../KimikoEngine';
import type { GameModeId } from '../types';

export interface GameModeMeta {
  id: GameModeId;
  name: string;
  icon: string;
  description: string;
}

export interface GameModeController {
  meta: GameModeMeta;
  /** Called once when the mode becomes active. */
  start(engine: KimikoEngine): void;
  /** Called when the finger mapped to `zoneIdx` is lifted. */
  onLift(engine: KimikoEngine, zoneIdx: number): void;
  /** Called every animation frame while this mode is active, after the base scene renders. */
  update?(engine: KimikoEngine, ctx: CanvasRenderingContext2D): void;
  /** Called once when the mode is torn down (exit or mode switch). */
  stop?(engine: KimikoEngine): void;
}
