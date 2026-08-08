interface HudProps {
  score: number;
  combo: number;
  mode: string | null;
}

export default function Hud({ score, combo, mode }: HudProps) {
  return (
    <div className="kimiko-glow pointer-events-auto fixed left-1/2 top-4 z-[100] flex -translate-x-1/2 items-center gap-6 rounded-[20px] border-[0.5px] border-kimiko-border bg-kimiko-bg/80 px-6 py-2.5 backdrop-blur-[10px]">
      <div className="text-center">
        <div className="text-2xl font-light text-kimiko-fg">{score}</div>
        <div className="text-[10px] uppercase tracking-widest text-kimiko-faint">score</div>
      </div>
      <div className="h-7 w-px bg-kimiko-border" />
      <div className="text-center">
        <div className="text-2xl font-light text-kimiko-fg">×{combo}</div>
        <div className="text-[10px] uppercase tracking-widest text-kimiko-faint">combo</div>
      </div>
      <div className="h-7 w-px bg-kimiko-border" />
      <div className="text-center">
        <div className="text-2xl font-light text-kimiko-fg">{mode ? mode.toUpperCase() : '—'}</div>
        <div className="text-[10px] uppercase tracking-widest text-kimiko-faint">mode</div>
      </div>
    </div>
  );
}
