interface PromptLetterProps {
  letter: string;
}

export default function PromptLetter({ letter }: PromptLetterProps) {
  return (
    <div className="kimiko-pulse pointer-events-none fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 text-[120px] font-thin tracking-tighter text-kimiko-accent/15 transition-all duration-300">
      {letter}
    </div>
  );
}
