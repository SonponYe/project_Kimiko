import type { GameModeMeta } from '@/lib/engine/modes/types';

interface ModeCardProps {
  mode: GameModeMeta;
  onSelect: () => void;
}

export default function ModeCard({ mode, onSelect }: ModeCardProps) {
  return (
    <button
      onClick={onSelect}
      className="flex flex-col items-center gap-2 rounded-2xl border-[1.5px] border-kimiko-border bg-kimiko-panel px-4 py-5 transition-transform active:scale-95 active:border-kimiko-accent"
    >
      <span className="text-3xl">{mode.icon}</span>
      <span className="text-sm font-medium text-kimiko-fg">{mode.name}</span>
      <span className="text-xs leading-relaxed text-kimiko-dim">{mode.description}</span>
    </button>
  );
}
