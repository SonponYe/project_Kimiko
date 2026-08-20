'use client';

import type { RefObject } from 'react';
import ExitButton from '@/components/game/ExitButton';
import FeedbackFlash from '@/components/game/FeedbackFlash';
import Hud from '@/components/game/Hud';
import PromptLetter from '@/components/game/PromptLetter';
import TypedDisplay from '@/components/game/TypedDisplay';
import type { KimikoEngine } from '@/lib/engine/KimikoEngine';
import type { EngineSnapshot } from '@/lib/engine/types';
import { useState } from 'react';

interface GameScreenProps {
  snapshot: EngineSnapshot;
  engineRef: RefObject<KimikoEngine | null>;
}

export default function GameScreen({ snapshot, engineRef }: GameScreenProps) {
  const [localPaused, setLocalPaused] = useState(false);

  function togglePause() {
    if (snapshot.mode === null) return;
    if (localPaused) {
      engineRef.current?.resumeGame();
      setLocalPaused(false);
    } else {
      engineRef.current?.pauseGame();
      setLocalPaused(true);
    }
  }
  return (
    <>
      <Hud score={snapshot.score} combo={snapshot.combo} mode={snapshot.mode} />
      <ExitButton onExit={() => engineRef.current?.exitGame()} />
      <button
        onClick={togglePause}
        className="kimiko-btn-cut pointer-events-auto fixed right-4 top-16 z-[200] border-[0.5px] border-kimiko-border bg-kimiko-bg/80 px-5 py-2 text-[13px] uppercase tracking-widest text-kimiko-dim transition-colors active:text-kimiko-fg"
      >
        {localPaused ? '▶ Resume' : '⏸ Pause'}
      </button>
      {localPaused && (
        <div className="pointer-events-auto fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="kimiko-panel-cut kimiko-corner-brackets border-[0.5px] border-kimiko-border bg-kimiko-panel p-8">
            <div className="mb-5 text-center text-lg font-medium uppercase italic tracking-widest text-kimiko-fg">Paused</div>
            <div className="flex justify-center">
              <button
                onClick={togglePause}
                className="kimiko-btn-cut bg-kimiko-accent px-8 py-2.5 text-sm font-medium uppercase italic tracking-widest text-kimiko-bg transition-transform active:scale-95"
              >
                Resume
              </button>
            </div>
          </div>
        </div>
      )}
      {snapshot.typedDisplay && <TypedDisplay display={snapshot.typedDisplay} />}
      <PromptLetter letter={snapshot.promptLetter} />
      <FeedbackFlash flash={snapshot.flash} />
    </>
  );
}
