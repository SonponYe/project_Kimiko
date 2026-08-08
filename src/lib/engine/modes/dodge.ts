import { CANVAS_COLORS } from '../constants';
import { drawDodgeObject } from '../renderer';
import type { KimikoEngine } from '../KimikoEngine';
import type { DodgeObject } from '../types';
import type { GameModeController, GameModeMeta } from './types';

export const DODGE_META: GameModeMeta = {
  id: 'dodge',
  name: 'Dodge',
  icon: '⚡',
  description: 'Lift to zap incoming things',
};

export function createDodgeMode(): GameModeController {
  let objects: DodgeObject[] = [];

  function spawn(engine: KimikoEngine) {
    const targetIdx = Math.floor(Math.random() * 10);
    const zone = engine.fingerZones[targetIdx];
    if (zone) {
      objects.push({
        x: zone.x,
        y: -40,
        targetX: zone.x,
        targetY: zone.y,
        targetIdx,
        radius: 18,
        speed: 1.2 + engine.score * 0.003,
        color: CANVAS_COLORS.danger,
        alive: true,
      });
    }
    const delay = Math.max(800, 2400 - engine.score * 5);
    engine.schedule(() => spawn(engine), delay);
  }

  return {
    meta: DODGE_META,

    start(engine) {
      objects = [];
      spawn(engine);
    },

    onLift(engine, zoneIdx) {
      const h = engine.canvasSize().h;
      const hit = objects.find((o) => o.targetIdx === zoneIdx && o.alive && o.y > h * 0.2);
      if (!hit) return;

      hit.alive = false;
      engine.bumpCombo(10);
      engine.addScore(20 * engine.combo);
      engine.flash('ZAP!', CANVAS_COLORS.accent);
      engine.spawnParticles(hit.x, hit.y, CANVAS_COLORS.accent, 20);
    },

    update(engine, ctx) {
      const h = engine.canvasSize().h;
      objects = objects.filter((o) => o.alive && o.y < h + 60);

      for (const o of objects) {
        o.y += o.speed;
        const zone = engine.fingerZones[o.targetIdx];
        drawDodgeObject(ctx, o, zone);

        if (zone && Math.hypot(o.x - zone.x, o.y - zone.y) < 30) {
          o.alive = false;
          engine.resetCombo();
          engine.subtractScore(15);
          engine.flash('HIT!', CANVAS_COLORS.danger);
          engine.spawnParticles(zone.x, zone.y, CANVAS_COLORS.danger, 15);
        }
      }
    },

    stop() {
      objects = [];
    },
  };
}
