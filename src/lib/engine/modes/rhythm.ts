import { CANVAS_COLORS } from '../constants';
import type { KimikoEngine } from '../KimikoEngine';
import type { GameModeController, GameModeMeta } from './types';

export const RHYTHM_META: GameModeMeta = {
  id: 'rhythm',
  name: 'Rhythm',
  icon: '🎵',
  description: 'Lift on the beat',
};

const BPM = 75;
const BEAT_MS = (60 / BPM) * 1000;

export function createRhythmMode(): GameModeController {
  let promptFinger = -1;
  let lastBeatTime = 0;

  function beat(engine: KimikoEngine) {
    const idx = Math.floor(Math.random() * 10);
    promptFinger = idx;
    lastBeatTime = performance.now();
    engine.highlightZone(idx);
    engine.setPrompt('♩');
    const zone = engine.fingerZones[idx];
    if (zone) engine.spawnParticles(zone.x, zone.y, CANVAS_COLORS.glow, 6);

    engine.schedule(() => beat(engine), BEAT_MS);
  }

  return {
    meta: RHYTHM_META,

    start(engine) {
      promptFinger = -1;
      beat(engine);
    },

    onLift(engine, zoneIdx) {
      if (zoneIdx !== promptFinger) return;

      const diff = Math.abs(performance.now() - lastBeatTime);
      if (diff < 300) {
        engine.bumpCombo(12);
        engine.addScore(15 * engine.combo);
        engine.flash('PERFECT', CANVAS_COLORS.accent);
      } else if (diff < 600) {
        engine.addScore(8);
        engine.flash('GOOD', CANVAS_COLORS.glow);
      } else {
        engine.flash('LATE', CANVAS_COLORS.dim);
      }

      const zone = engine.fingerZones[zoneIdx];
      if (zone) engine.spawnParticles(zone.x, zone.y, zone.color, 10);
    },
  };
}
