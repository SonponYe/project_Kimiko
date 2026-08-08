import type { TypedDisplayState } from '@/lib/engine/types';

interface TypedDisplayProps {
  display: TypedDisplayState;
}

export default function TypedDisplay({ display }: TypedDisplayProps) {
  return (
    <div className="pointer-events-none fixed bottom-[60px] left-1/2 z-[100] min-w-[200px] -translate-x-1/2 rounded-xl border-[0.5px] border-kimiko-border bg-kimiko-bg/70 px-6 py-2.5 text-center text-[28px] font-light tracking-[4px] text-kimiko-fg">
      <span className="text-kimiko-accent">{display.done}</span>
      <span className="text-kimiko-rest">
        {display.done ? ' ' : ''}
        {display.rest}
      </span>
    </div>
  );
}
