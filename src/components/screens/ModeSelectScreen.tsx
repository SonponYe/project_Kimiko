'use client';

import type { RefObject } from 'react';
import ModeCard from '@/components/game/ModeCard';
import { GAME_MODES } from '@/lib/engine/modes/registry';
import type { KimikoEngine } from '@/lib/engine/KimikoEngine';

interface ModeSelectScreenProps {
  engineRef: RefObject<KimikoEngine | null>;
}

export default function ModeSelectScreen({ engineRef }: ModeSelectScreenProps) {
  return (
    <div className="pointer-events-auto flex h-full w-full flex-col items-center justify-center gap-4 bg-kimiko-bg/95 px-10 text-center">
      <p className="text-xl font-medium text-kimiko-fg">Choose your mode</p>
      <p className="mb-2 text-sm text-kimiko-sub">Place your fingers next</p>
      <div className="grid w-full max-w-[360px] grid-cols-2 gap-3">
        {GAME_MODES.map((mode) => (
          <ModeCard key={mode.id} mode={mode} onSelect={() => engineRef.current?.selectMode(mode.id)} />
        ))}
      </div>
    </div>
  );
}
