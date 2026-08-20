import type { Phase } from '@/lib/racer/types';

interface RacerHudProps {
  score: number;
  best: number;
  phase: Phase;
  phaseProgress: number;
}

export default function RacerHud({ score, best, phase, phaseProgress }: RacerHudProps) {
  const isSolid = phase === 'solid';

  return (
    <div className="kimiko-glow kimiko-panel-cut kimiko-corner-brackets pointer-events-none fixed left-1/2 top-4 z-[100] flex -translate-x-1/2 items-center gap-6 border-[0.5px] border-kimiko-border bg-kimiko-bg/80 px-7 py-2.5 backdrop-blur-[10px]">
      <div className="text-center">
        <div className="text-2xl font-light italic text-kimiko-fg">{score}</div>
        <div className="text-[10px] uppercase tracking-widest text-kimiko-faint">score</div>
      </div>
      <div className="h-7 w-px bg-kimiko-border" />
      <div className="text-center">
        <div className="text-2xl font-light italic text-kimiko-fg">{best}</div>
        <div className="text-[10px] uppercase tracking-widest text-kimiko-faint">best</div>
      </div>
      <div className="h-7 w-px bg-kimiko-border" />
      <div className="w-20 text-center">
        <div className={`text-sm font-medium uppercase italic tracking-wide ${isSolid ? 'text-kimiko-fg' : 'text-kimiko-dim'}`}>
          {phase}
        </div>
        <div className="mt-1 h-[3px] w-full overflow-hidden rounded-none bg-kimiko-border">
          <div
            className={`h-full ${isSolid ? 'bg-kimiko-accent' : 'bg-kimiko-dim'}`}
            style={{ width: `${Math.max(0, Math.min(1, phaseProgress)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
