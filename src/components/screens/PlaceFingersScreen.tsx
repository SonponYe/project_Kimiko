import type { GameModeMeta } from '@/lib/engine/modes/types';

interface PlaceFingersScreenProps {
  fingerCount: number;
  countdown: number | null;
  modeMeta: GameModeMeta | null;
}

export default function PlaceFingersScreen({ fingerCount, countdown, modeMeta }: PlaceFingersScreenProps) {
  if (countdown !== null) {
    return (
      <div className="pointer-events-auto flex h-full w-full flex-col items-center justify-center gap-3 bg-kimiko-bg px-10 text-center">
        <p className="text-sm uppercase tracking-widest text-kimiko-sub">
          {modeMeta ? `Starting ${modeMeta.name}` : 'Starting'}
        </p>
        <div key={countdown} className="kimiko-pulse text-8xl font-extralight text-kimiko-accent">
          {countdown}
        </div>
      </div>
    );
  }

  const hint =
    fingerCount >= 10
      ? '✓ All fingers detected!'
      : fingerCount < 5
        ? 'Keep placing fingers…'
        : `${10 - fingerCount} more to go`;

  return (
    <div className="pointer-events-auto flex h-full w-full flex-col items-center justify-center gap-4 bg-kimiko-bg px-10 text-center">
      <p className="text-[22px] font-medium text-kimiko-fg">Place all 10 fingers</p>
      {modeMeta && (
        <p className="text-xs uppercase tracking-widest text-kimiko-dim">
          {modeMeta.icon} {modeMeta.name}
        </p>
      )}
      <p className="max-w-[300px] text-sm leading-relaxed text-kimiko-sub">
        Left hand angled in from the left, right hand from the right. Leave space in the middle.
      </p>
      <div className="kimiko-pulse text-6xl font-extralight tracking-tighter text-kimiko-accent">{fingerCount}</div>
      <div className="text-[13px] uppercase tracking-widest text-kimiko-dim">fingers detected</div>
      <p className="mt-2 text-sm leading-relaxed text-kimiko-sub">{hint}</p>
    </div>
  );
}
