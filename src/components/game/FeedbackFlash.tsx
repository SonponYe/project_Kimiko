import type { FlashEvent } from '@/lib/engine/types';

interface FeedbackFlashProps {
  flash: FlashEvent | null;
}

export default function FeedbackFlash({ flash }: FeedbackFlashProps) {
  return (
    <div
      key={flash?.id}
      className={`pointer-events-none fixed left-1/2 top-1/2 z-[200] -translate-x-1/2 -translate-y-1/2 font-extralight italic uppercase tracking-wide transition-opacity duration-150 ${
        flash ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        color: flash?.color,
        fontSize: flash && flash.text.length > 3 ? '32px' : '48px',
      }}
    >
      {flash?.text}
    </div>
  );
}
