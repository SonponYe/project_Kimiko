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
        className="pointer-events-auto fixed right-4 top-16 z-[200] rounded-xl border-[0.5px] border-kimiko-border bg-kimiko-bg/80 px-4 py-2 text-[13px] text-kimiko-dim transition-colors active:text-kimiko-fg"
      >
        {localPaused ? '▶ resume' : '⏸ pause'}
      </button>
      {localPaused && (
        <div className="pointer-events-auto fixed inset-0 z-[250] flex items-center justify-center bg-black/40">
          <div className="rounded-xl bg-kimiko-panel p-6">
            <div className="mb-4 text-lg font-medium text-kimiko-fg">Paused</div>
            <div className="flex justify-center">
              <button
                onClick={togglePause}
                className="rounded-lg bg-kimiko-accent px-4 py-2 text-sm font-medium text-black"
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
