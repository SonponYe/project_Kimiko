'use client';

import { useRef } from 'react';
import GameScreen from '@/components/screens/GameScreen';
import IntroScreen from '@/components/screens/IntroScreen';
import ModeSelectScreen from '@/components/screens/ModeSelectScreen';
import PlaceFingersScreen from '@/components/screens/PlaceFingersScreen';
import { useKimikoEngine } from '@/hooks/useKimikoEngine';
import { useOrientationWarning } from '@/hooks/useOrientation';
import GameCanvas from './GameCanvas';
import OrientationWarning from './OrientationWarning';

export default function GameRoot() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { engineRef, snapshot } = useKimikoEngine(canvasRef);
  const needsOrientationWarning = useOrientationWarning();

  return (
    <div className="relative h-dvh w-dvw overflow-hidden bg-kimiko-bg text-kimiko-fg">
      <GameCanvas canvasRef={canvasRef} engineRef={engineRef} />

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        {snapshot.screen === 'intro' && <IntroScreen engineRef={engineRef} />}
        {snapshot.screen === 'place' && <PlaceFingersScreen fingerCount={snapshot.fingerCount} />}
        {snapshot.screen === 'mode-select' && <ModeSelectScreen engineRef={engineRef} />}
        {snapshot.screen === 'game' && <GameScreen snapshot={snapshot} engineRef={engineRef} />}
      </div>

      {needsOrientationWarning && <OrientationWarning />}
    </div>
  );
}
