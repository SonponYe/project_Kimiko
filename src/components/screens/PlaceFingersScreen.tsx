import { DEFAULT_FINGER_COUNT } from '@/lib/engine/constants';
import type { GameModeMeta } from '@/lib/engine/modes/types';

interface PlaceFingersScreenProps {
  fingerCount: number;
  countdown: number | null;
  modeMeta: GameModeMeta | null;
  maxTouchPoints: number | null;
}

function ModeLabel({ modeMeta }: { modeMeta: GameModeMeta }) {
  if (modeMeta.icon.startsWith('/')) {
    return (
      <>
        <img src={modeMeta.icon} alt={modeMeta.name} className="mr-2 inline-block h-5 w-5 align-middle" />
        {modeMeta.name}
      </>
    );
  }
  return (
    <>
      {modeMeta.icon} {modeMeta.name}
    </>
  );
}

export default function PlaceFingersScreen({ fingerCount, countdown, modeMeta, maxTouchPoints }: PlaceFingersScreenProps) {
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

  // 4 (index + thumb per hand) is the design target — only a device that
  // genuinely can't sense that many touches at once lowers it further.
  const required = maxTouchPoints !== null && maxTouchPoints < DEFAULT_FINGER_COUNT ? maxTouchPoints : DEFAULT_FINGER_COUNT;

  const hardwareCapped = maxTouchPoints !== null && maxTouchPoints < DEFAULT_FINGER_COUNT && fingerCount >= maxTouchPoints;

  const hint = hardwareCapped
    ? `This device only senses ${maxTouchPoints} touch${maxTouchPoints === 1 ? '' : 'es'} at once — it can't detect more, even resting flat.`
    : fingerCount >= required
      ? '✓ All fingers detected!'
      : `${required - fingerCount} more to go`;

  return (
    <div className="pointer-events-auto flex h-full w-full flex-col items-center justify-center gap-4 bg-kimiko-bg px-10 text-center">
      <p className="text-[22px] font-medium text-kimiko-fg">Place your {required} fingers</p>
      {modeMeta && (
        <p className="text-xs uppercase tracking-widest text-kimiko-dim">
          <ModeLabel modeMeta={modeMeta} />
        </p>
      )}
      <p className="max-w-[300px] text-sm leading-relaxed text-kimiko-sub">
        Index finger and thumb on each hand, angled in from the sides. Leave space in the middle.
      </p>
      <div className="kimiko-pulse text-6xl font-extralight tracking-tighter text-kimiko-accent">{fingerCount}</div>
      <div className="text-[13px] uppercase tracking-widest text-kimiko-dim">fingers detected</div>
      <p className={`mt-2 max-w-[300px] text-sm leading-relaxed ${hardwareCapped ? 'text-kimiko-danger' : 'text-kimiko-sub'}`}>
        {hint}
      </p>
    </div>
  );
}
