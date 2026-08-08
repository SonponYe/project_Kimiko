'use client';

import type { RefObject } from 'react';
import HandDiagram from '@/components/game/HandDiagram';
import type { KimikoEngine } from '@/lib/engine/KimikoEngine';

interface IntroScreenProps {
  engineRef: RefObject<KimikoEngine | null>;
}

export default function IntroScreen({ engineRef }: IntroScreenProps) {
  return (
    <div className="pointer-events-auto flex h-full w-full flex-col items-center justify-center gap-5 bg-kimiko-bg px-10 text-center">
      <h1 className="text-[56px] font-light tracking-tight text-kimiko-fg">
        KIM<span className="kimiko-pulse font-semibold text-kimiko-accent">IKO</span>
      </h1>
      <p className="max-w-[280px] text-base leading-relaxed tracking-wide text-kimiko-muted">
        Put your phone down. Place your hands. The screen becomes your keyboard.
      </p>

      <div className="my-2 flex items-end gap-12">
        <HandDiagram side="left" />
        <HandDiagram side="right" />
      </div>

      <button
        onClick={() => engineRef.current?.showPlace()}
        className="kimiko-glow rounded-2xl bg-kimiko-accent px-10 py-4 text-[17px] font-medium tracking-wide text-kimiko-bg transition-transform active:scale-95 active:bg-kimiko-accent-dark"
      >
        Begin
      </button>
      <p className="mt-2 text-xs text-kimiko-rest">Best on a real device, flat surface</p>
    </div>
  );
}
