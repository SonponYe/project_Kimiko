import { CANVAS_COLORS } from '../constants';
import type { KimikoEngine } from '../KimikoEngine';
import type { GameModeController, GameModeMeta } from './types';

export const MEMORY_META: GameModeMeta = {
  id: 'memory',
  name: 'Memory',
  icon: '🧠',
  description: 'Mirror the tap sequence',
};

export function createMemoryMode(): GameModeController {
  let sequence: number[] = [];
  let step = 0;

  function playSequence(engine: KimikoEngine, i: number) {
    if (i >= sequence.length) {
      engine.setPrompt('👆');
      return;
    }
    engine.schedule(() => {
      engine.highlightZone(sequence[i]);
      engine.setPrompt(String(i + 1));
      engine.schedule(() => playSequence(engine, i + 1), 600);
    }, 500);
  }

  function startRound(engine: KimikoEngine) {
    sequence.push(Math.floor(Math.random() * 10));
    step = 0;
    playSequence(engine, 0);
  }

  return {
    meta: MEMORY_META,

    start(engine) {
      sequence = [];
      engine.schedule(() => startRound(engine), 800);
    },

    onLift(engine, zoneIdx) {
      if (sequence[step] === zoneIdx) {
        step++;
        const zone = engine.fingerZones[zoneIdx];
        if (zone) engine.spawnParticles(zone.x, zone.y, zone.color, 8);

        if (step >= sequence.length) {
          engine.incrementCombo();
          engine.addScore(sequence.length * 15 * engine.combo);
          engine.flash('✓', CANVAS_COLORS.accent);
          engine.schedule(() => startRound(engine), 1000);
        }
      } else {
        engine.resetCombo();
        engine.subtractScore(20);
        engine.flash('✗', CANVAS_COLORS.danger);
        engine.schedule(() => {
          sequence = [];
          engine.schedule(() => startRound(engine), 600);
        }, 500);
      }
    },
  };
}
