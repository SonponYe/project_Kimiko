'use client';

import { useState } from 'react';
import type { RefObject } from 'react';
import ModeCard from '@/components/game/ModeCard';
import { GAME_MODES } from '@/lib/engine/modes/registry';
import type { KimikoEngine } from '@/lib/engine/KimikoEngine';

interface ModeSelectScreenProps {
  engineRef: RefObject<KimikoEngine | null>;
}

export default function ModeSelectScreen({ engineRef }: ModeSelectScreenProps) {
  const [animating, setAnimating] = useState<string | null>(null);

  function handleSelect(id: string) {
    // play a short selection animation before handing control to engine
    setAnimating(id);
    setTimeout(() => {
      engineRef.current?.selectMode(id as any);
    }, 220);
  }

  return (
    <div
      className={`pointer-events-auto flex h-full w-full flex-col items-center justify-center gap-4 bg-kimiko-bg/95 px-10 text-center transition-all duration-220 ${
        animating ? 'opacity-60 scale-95' : 'opacity-100'
      }`}
    >
      <p className="text-xl font-medium text-kimiko-fg">Choose your mode</p>
      <p className="mb-2 text-sm text-kimiko-sub">Place your fingers next</p>
      <div className="grid w-full max-w-[360px] grid-cols-2 gap-3">
        {GAME_MODES.map((mode) => (
          <ModeCard key={mode.id} mode={mode} onSelect={() => handleSelect(mode.id)} />
        ))}
      </div>
    </div>
  );
}
