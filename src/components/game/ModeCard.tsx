import type { GameModeMeta } from '@/lib/engine/modes/types';

interface ModeCardProps {
  mode: GameModeMeta;
  onSelect: () => void;
}

export default function ModeCard({ mode, onSelect }: ModeCardProps) {
  return (
    <button
      onClick={onSelect}
      className="kimiko-panel-cut flex flex-col items-center gap-2 border-[1.5px] border-kimiko-border bg-kimiko-panel px-4 py-5 transition-transform active:scale-95 active:border-kimiko-accent"
    >
      {mode.icon.startsWith('/') ? (
        <img src={mode.icon} alt={mode.name} className="h-12 w-12 opacity-80" />
      ) : (
        <span className="text-3xl opacity-80">{mode.icon}</span>
      )}
      <span className="text-sm font-medium uppercase italic tracking-wide text-kimiko-fg">{mode.name}</span>
      <span className="text-xs leading-relaxed text-kimiko-dim">{mode.description}</span>
    </button>
  );
}
