'use client';

import { useEffect, useState, type RefObject } from 'react';
import type { RacerEngine } from '@/lib/racer/RacerEngine';

interface GameOverScreenProps {
  engineRef: RefObject<RacerEngine | null>;
  score: number;
  best: number;
  newBest: boolean;
}

export default function GameOverScreen({ engineRef, score, best, newBest }: GameOverScreenProps) {
  // Frantic last-second taps shouldn't dismiss the result by accident.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 450);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="kimiko-fade-in pointer-events-auto fixed inset-0 z-[250] flex flex-col items-center justify-center gap-4 bg-black/60 px-10 text-center backdrop-blur-sm">
      <div className="kimiko-pop-in kimiko-panel-cut kimiko-corner-brackets flex flex-col items-center gap-4 border-[0.5px] border-kimiko-border bg-kimiko-panel px-10 py-8">
        <p className="text-sm uppercase italic tracking-widest text-kimiko-dim">Caught solid</p>
        <div className="kimiko-pulse text-6xl font-extralight italic tabular-nums text-kimiko-fg">{score}</div>
        {newBest ? (
          <p className="text-xs uppercase tracking-widest text-kimiko-accent">New best</p>
        ) : (
          <p className="text-xs uppercase tracking-widest text-kimiko-dim">Best {best}</p>
        )}

        <button
          disabled={!ready}
          onClick={() => engineRef.current?.restart()}
          className="kimiko-glow kimiko-btn-cut mt-2 bg-kimiko-accent px-10 py-3 text-sm font-medium uppercase italic tracking-widest text-kimiko-bg transition-[transform,opacity] active:scale-95 disabled:opacity-40"
        >
          Retry
        </button>
        <button
          disabled={!ready}
          onClick={() => engineRef.current?.showIntro()}
          className="px-4 py-2 text-xs uppercase tracking-widest text-kimiko-sub transition-colors active:text-kimiko-fg disabled:opacity-40"
        >
          Exit
        </button>
      </div>
    </div>
  );
}
