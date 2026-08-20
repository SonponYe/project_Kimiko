interface ExitButtonProps {
  onExit: () => void;
}

export default function ExitButton({ onExit }: ExitButtonProps) {
  return (
    <button
      onClick={onExit}
      className="kimiko-btn-cut pointer-events-auto fixed right-4 top-4 z-[200] border-[0.5px] border-kimiko-border bg-kimiko-bg/80 px-5 py-2 text-[13px] uppercase tracking-widest text-kimiko-dim transition-colors active:text-kimiko-fg"
    >
      ✕ Exit
    </button>
  );
}
