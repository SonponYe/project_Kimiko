'use client';

import type { RefObject } from 'react';
import ExitButton from '@/components/game/ExitButton';
import FeedbackFlash from '@/components/game/FeedbackFlash';
import Hud from '@/components/game/Hud';
import PromptLetter from '@/components/game/PromptLetter';
import TypedDisplay from '@/components/game/TypedDisplay';
import type { KimikoEngine } from '@/lib/engine/KimikoEngine';
import type { EngineSnapshot } from '@/lib/engine/types';

interface GameScreenProps {
  snapshot: EngineSnapshot;
  engineRef: RefObject<KimikoEngine | null>;
}

export default function GameScreen({ snapshot, engineRef }: GameScreenProps) {
  return (
    <>
      <Hud score={snapshot.score} combo={snapshot.combo} mode={snapshot.mode} />
      <ExitButton onExit={() => engineRef.current?.exitGame()} />
      {snapshot.typedDisplay && <TypedDisplay display={snapshot.typedDisplay} />}
      <PromptLetter letter={snapshot.promptLetter} />
      <FeedbackFlash flash={snapshot.flash} />
    </>
  );
}
