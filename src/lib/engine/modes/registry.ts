import { createDodgeMode, DODGE_META } from './dodge';
import { createMemoryMode, MEMORY_META } from './memory';
import { createRhythmMode, RHYTHM_META } from './rhythm';
import { createTypingMode, TYPING_META } from './typing';
import type { GameModeId } from '../types';
import type { GameModeController, GameModeMeta } from './types';

const FACTORIES: Record<GameModeId, () => GameModeController> = {
  typing: createTypingMode,
  dodge: createDodgeMode,
  memory: createMemoryMode,
  rhythm: createRhythmMode,
};

export const GAME_MODES: GameModeMeta[] = [TYPING_META, DODGE_META, MEMORY_META, RHYTHM_META];

export function createModeController(id: GameModeId): GameModeController {
  return FACTORIES[id]();
}
