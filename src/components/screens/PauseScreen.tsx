'use client';

import type { RefObject } from 'react';
import type { RacerEngine } from '@/lib/racer/RacerEngine';

interface PauseScreenProps {
  engineRef: RefObject<RacerEngine | null>;
}

export default function PauseScreen({ engineRef }: PauseScreenProps) {
  return (
    <div className="kimiko-fade-in pointer-events-auto fixed inset-0 z-[240] flex flex-col items-center justify-center bg-black/60 px-10 text-center backdrop-blur-sm">
      <div className="kimiko-pop-in kimiko-panel-cut kimiko-corner-brackets flex flex-col items-center gap-4 border-[0.5px] border-kimiko-border bg-kimiko-panel px-12 py-8">
        <p className="kimiko-pulse text-sm uppercase italic tracking-[0.3em] text-kimiko-dim">Paused</p>
        <button
          onClick={() => engineRef.current?.resume()}
          className="kimiko-btn-cut mt-2 bg-kimiko-accent px-10 py-3 text-sm font-medium uppercase italic tracking-widest text-kimiko-bg transition-transform active:scale-95"
        >
          Resume
        </button>
        <button
          onClick={() => engineRef.current?.showIntro()}
          className="px-4 py-2 text-xs uppercase tracking-widest text-kimiko-sub transition-colors active:text-kimiko-fg"
        >
          Exit
        </button>
      </div>
    </div>
  );
}
