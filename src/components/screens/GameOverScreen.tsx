'use client';

import type { RefObject } from 'react';
import type { RacerEngine } from '@/lib/racer/RacerEngine';

interface GameOverScreenProps {
  engineRef: RefObject<RacerEngine | null>;
  score: number;
  best: number;
}

export default function GameOverScreen({ engineRef, score, best }: GameOverScreenProps) {
  const isNewBest = score > 0 && score >= best;

  return (
    <div className="pointer-events-auto fixed inset-0 z-[250] flex flex-col items-center justify-center gap-4 bg-black/60 px-10 text-center backdrop-blur-sm">
      <div className="kimiko-panel-cut kimiko-corner-brackets flex flex-col items-center gap-4 border-[0.5px] border-kimiko-border bg-kimiko-panel px-10 py-8">
        <p className="text-sm uppercase italic tracking-widest text-kimiko-dim">Caught solid</p>
        <div className="kimiko-pulse text-6xl font-extralight italic text-kimiko-fg">{score}</div>
        {isNewBest ? (
          <p className="text-xs uppercase tracking-widest text-kimiko-accent">New best</p>
        ) : (
          <p className="text-xs uppercase tracking-widest text-kimiko-dim">Best {best}</p>
        )}

        <button
          onClick={() => engineRef.current?.restart()}
          className="kimiko-glow kimiko-btn-cut mt-2 bg-kimiko-accent px-10 py-3 text-sm font-medium uppercase italic tracking-widest text-kimiko-bg transition-transform active:scale-95"
        >
          Retry
        </button>
        <button
          onClick={() => engineRef.current?.showIntro()}
          className="text-xs uppercase tracking-widest text-kimiko-sub transition-colors active:text-kimiko-fg"
        >
          Exit
        </button>
      </div>
    </div>
  );
}
