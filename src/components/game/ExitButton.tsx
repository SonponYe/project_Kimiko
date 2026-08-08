interface ExitButtonProps {
  onExit: () => void;
}

export default function ExitButton({ onExit }: ExitButtonProps) {
  return (
    <button
      onClick={onExit}
      className="pointer-events-auto fixed right-4 top-4 z-[200] rounded-xl border-[0.5px] border-kimiko-border bg-kimiko-bg/80 px-4 py-2 text-[13px] text-kimiko-dim transition-colors active:text-kimiko-fg"
    >
      ✕ exit
    </button>
  );
}
