import { CANVAS_COLORS, LETTER_MAP, WORDS } from '../constants';
import type { KimikoEngine } from '../KimikoEngine';
import type { GameModeController, GameModeMeta } from './types';

export const TYPING_META: GameModeMeta = {
  id: 'typing',
  name: 'Type',
  icon: '⌨️',
  description: 'Lift fingers to type letters',
};

export function createTypingMode(): GameModeController {
  let currentWord = '';
  let wordProgress = 0;

  function updateDisplay(engine: KimikoEngine) {
    engine.setTypedDisplay({
      done: currentWord.slice(0, wordProgress),
      rest: currentWord.slice(wordProgress).split('').join(' '),
    });
  }

  function nextPrompt(engine: KimikoEngine) {
    currentWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    wordProgress = 0;
    updateDisplay(engine);
    engine.setPrompt(currentWord[0]);
  }

  return {
    meta: TYPING_META,

    start(engine) {
      nextPrompt(engine);
    },

    onLift(engine, zoneIdx) {
      const mapped = LETTER_MAP[zoneIdx];
      if (!mapped) return;

      const needed = currentWord[wordProgress];
      const zone = engine.fingerZones[zoneIdx];

      if (mapped === needed) {
        wordProgress++;
        engine.bumpCombo(8);
        engine.addScore(10 * engine.combo);
        engine.flash(`+${10 * engine.combo}`, CANVAS_COLORS.accent);
        if (zone) engine.spawnParticles(zone.x, zone.y, zone.color, 12);
        updateDisplay(engine);

        if (wordProgress >= currentWord.length) {
          engine.schedule(() => nextPrompt(engine), 400);
        } else {
          engine.setPrompt(currentWord[wordProgress]);
        }
      } else {
        engine.resetCombo();
        engine.flash('✗', CANVAS_COLORS.danger);
      }
    },
  };
}
