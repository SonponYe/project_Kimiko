interface PlaceFingersScreenProps {
  fingerCount: number;
}

export default function PlaceFingersScreen({ fingerCount }: PlaceFingersScreenProps) {
  const hint =
    fingerCount >= 10
      ? '✓ All fingers detected!'
      : fingerCount < 5
        ? 'Keep placing fingers…'
        : `${10 - fingerCount} more to go`;

  return (
    <div className="pointer-events-auto flex h-full w-full flex-col items-center justify-center gap-4 bg-kimiko-bg px-10 text-center">
      <p className="text-[22px] font-medium text-kimiko-fg">Place all 10 fingers</p>
      <p className="max-w-[300px] text-sm leading-relaxed text-kimiko-sub">
        Left hand angled in from the left, right hand from the right. Leave space in the middle.
      </p>
      <div className="kimiko-pulse text-6xl font-extralight tracking-tighter text-kimiko-accent">{fingerCount}</div>
      <div className="text-[13px] uppercase tracking-widest text-kimiko-dim">fingers detected</div>
      <p className="mt-2 text-sm leading-relaxed text-kimiko-sub">{hint}</p>
    </div>
  );
}
