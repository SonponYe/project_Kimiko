'use client';

import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { RacerEngine } from '@/lib/racer/RacerEngine';

interface IntroScreenProps {
  engineRef: RefObject<RacerEngine | null>;
  best: number;
}

export default function IntroScreen({ engineRef, best }: IntroScreenProps) {
  const [animating, setAnimating] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function handleBegin() {
    if (animating) return;
    setAnimating(true);
    timer.current = setTimeout(() => engineRef.current?.startGame(), 220);
  }

  return (
    <div
      className={`kimiko-fade-in pointer-events-auto flex h-full w-full flex-col items-center justify-center gap-5 bg-kimiko-bg/85 px-10 text-center transition-all duration-200 ease-out ${animating ? 'scale-95 opacity-0' : ''}`}
    >
      <h1 className="text-[56px] font-light italic tracking-tight text-kimiko-fg">
        KIM<span className="kimiko-pulse font-semibold text-kimiko-accent">IKO</span>
      </h1>
      <p className="max-w-[300px] text-base leading-relaxed tracking-wide text-kimiko-muted">
        Tap left or right to switch lanes. Dodge what&apos;s solid, collect what isn&apos;t.
      </p>
      <p className="max-w-[300px] text-sm leading-relaxed text-kimiko-sub">
        Your ghost drifts between <span className="text-kimiko-accent">solid</span> and{' '}
        <span className="italic text-kimiko-dim">spectral</span> on its own. Solid gets hit, and scores. Spectral
        passes through everything, untouched and unscored.
      </p>
      <p className="max-w-[300px] text-xs leading-relaxed text-kimiko-dim">
        Grab glowing rings while solid for a <span className="text-kimiko-sub">shield</span>,{' '}
        <span className="text-kimiko-sub">magnet</span>, <span className="text-kimiko-sub">slow-mo</span> or{' '}
        <span className="text-kimiko-sub">×2</span> score.
      </p>

      {best > 0 && <p className="text-xs uppercase tracking-widest text-kimiko-dim">Best {best}</p>}

      <button
        onClick={handleBegin}
        className="kimiko-glow kimiko-btn-cut bg-kimiko-accent px-12 py-4 text-[17px] font-medium uppercase italic tracking-widest text-kimiko-bg transition-transform active:scale-95 active:bg-kimiko-accent-dark"
      >
        Begin
      </button>
    </div>
  );
}
