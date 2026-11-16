'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { POWER_LABEL } from '@/lib/racer/constants';
import type { RacerEngine } from '@/lib/racer/RacerEngine';
import type { Phase, PowerKind } from '@/lib/racer/types';

interface RacerHudProps {
  engineRef: RefObject<RacerEngine | null>;
  score: number;
  best: number;
  phase: Phase;
  powerups: PowerKind[];
}

export default function RacerHud({ engineRef, score, best, phase, powerups }: RacerHudProps) {
  const isSolid = phase === 'solid';
  const phaseBar = useRef<HTMLDivElement>(null);
  const powerBars = useRef<Partial<Record<PowerKind, HTMLDivElement | null>>>({});

  // Bars are driven straight from the engine each frame, so they move
  // smoothly without pushing a React render per frame.
  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      const live = engineRef.current?.getLive();
      if (live) {
        const bar = phaseBar.current;
        if (bar) {
          bar.style.transform = `scaleX(${Math.max(0, Math.min(1, live.phaseProgress))})`;
          bar.style.opacity = live.phaseWarning ? String(0.55 + 0.45 * Math.sin(now * 0.04)) : '1';
        }
        for (const kind of Object.keys(powerBars.current) as PowerKind[]) {
          const el = powerBars.current[kind];
          if (el) el.style.transform = `scaleX(${Math.max(0, Math.min(1, live.powerFill[kind]))})`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [engineRef]);

  return (
    <>
      <div
        className="pointer-events-none fixed left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2"
        style={{ top: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <div className="kimiko-glow kimiko-panel-cut kimiko-corner-brackets flex items-center gap-6 border-[0.5px] border-kimiko-border bg-kimiko-bg/80 px-7 py-2.5 backdrop-blur-[10px]">
          <div className="min-w-12 text-center">
            <div className="text-2xl font-light italic tabular-nums text-kimiko-fg">{score}</div>
            <div className="text-[10px] uppercase tracking-widest text-kimiko-faint">score</div>
          </div>
          <div className="h-7 w-px bg-kimiko-border" />
          <div className="min-w-12 text-center">
            <div className="text-2xl font-light italic tabular-nums text-kimiko-fg">{Math.max(best, score)}</div>
            <div className="text-[10px] uppercase tracking-widest text-kimiko-faint">best</div>
          </div>
          <div className="h-7 w-px bg-kimiko-border" />
          <div className="w-20 text-center">
            <div
              className={`text-sm font-medium uppercase italic tracking-wide transition-colors duration-200 ${isSolid ? 'text-kimiko-fg' : 'text-kimiko-dim'}`}
            >
              {phase}
            </div>
            <div className="mt-1 h-[3px] w-full overflow-hidden bg-kimiko-border">
              <div
                ref={phaseBar}
                className={`h-full origin-left transition-colors duration-200 ${isSolid ? 'bg-kimiko-accent' : 'bg-kimiko-dim'}`}
              />
            </div>
          </div>
        </div>

        {powerups.length > 0 && (
          <div className="flex items-center gap-2">
            {powerups.map((kind) => (
              <div
                key={kind}
                className="kimiko-chip-in kimiko-btn-cut border-[0.5px] border-kimiko-border bg-kimiko-bg/80 px-4 pb-1.5 pt-1 backdrop-blur-[10px]"
              >
                <div className="text-[10px] font-medium uppercase italic tracking-widest text-kimiko-fg">
                  {POWER_LABEL[kind]}
                </div>
                <div className="mt-1 h-[2px] w-full overflow-hidden bg-kimiko-border">
                  <div
                    ref={(el) => {
                      powerBars.current[kind] = el;
                    }}
                    className="h-full origin-left bg-kimiko-accent"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        aria-label="Pause"
        onClick={() => engineRef.current?.pause()}
        className="pointer-events-auto fixed right-3 z-[100] flex h-11 w-11 items-center justify-center text-kimiko-sub transition-colors active:text-kimiko-fg"
        style={{ top: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <span className="flex gap-[4px]">
          <span className="h-4 w-[3px] bg-current" />
          <span className="h-4 w-[3px] bg-current" />
        </span>
      </button>
    </>
  );
}
