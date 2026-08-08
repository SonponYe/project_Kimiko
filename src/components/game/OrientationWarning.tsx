import type { GameModeMeta } from '@/lib/engine/modes/types';

interface OrientationWarningProps {
  modeMeta: GameModeMeta | null;
}

export default function OrientationWarning({ modeMeta }: OrientationWarningProps) {
  return (
    <div className="pointer-events-auto absolute inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-kimiko-bg px-10 text-center">
      <svg width={72} height={72} viewBox="0 0 72 72" fill="none" className="kimiko-pulse text-kimiko-accent">
        <rect x={24} y={14} width={24} height={44} rx={5} stroke="currentColor" strokeWidth={2.5} />
        <line x1={36} y1={51} x2={36} y2={51} stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
        <path
          d="M55 24a19 19 0 1 1 -6-14"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          fill="none"
        />
        <path d="M49 6l4 5 5-3" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <p className="text-lg font-medium text-kimiko-fg">Rotate your phone</p>
      <p className="max-w-[280px] text-base leading-relaxed text-kimiko-sub">
        {modeMeta
          ? `Lay it flat, landscape, then rest all ten fingers to start ${modeMeta.name}.`
          : 'Lay it flat, landscape, then rest all ten fingers on the screen.'}
      </p>
    </div>
  );
}
