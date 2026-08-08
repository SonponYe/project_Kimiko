'use client';

import { useRef } from 'react';
import GameScreen from '@/components/screens/GameScreen';
import IntroScreen from '@/components/screens/IntroScreen';
import ModeSelectScreen from '@/components/screens/ModeSelectScreen';
import PlaceFingersScreen from '@/components/screens/PlaceFingersScreen';
import { useKimikoEngine } from '@/hooks/useKimikoEngine';
import { useIsPortrait } from '@/hooks/useOrientation';
import { getModeMeta } from '@/lib/engine/modes/registry';
import GameCanvas from './GameCanvas';
import OrientationWarning from './OrientationWarning';

// Only the finger-placement and in-game steps actually require the phone
// flat in landscape — intro and mode-select are just button taps, so the
// rotate prompt shouldn't block them.
const SCREENS_REQUIRING_LANDSCAPE = new Set(['place', 'game']);

export default function GameRoot() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { engineRef, snapshot } = useKimikoEngine(canvasRef);
  const isPortrait = useIsPortrait();
  const needsOrientationWarning = isPortrait && SCREENS_REQUIRING_LANDSCAPE.has(snapshot.screen);
  const pendingModeMeta = snapshot.pendingMode ? getModeMeta(snapshot.pendingMode) : null;

  return (
    <div className="relative h-dvh w-dvw overflow-hidden bg-kimiko-bg text-kimiko-fg">
      <GameCanvas canvasRef={canvasRef} engineRef={engineRef} />

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        {snapshot.screen === 'intro' && <IntroScreen engineRef={engineRef} />}
        {snapshot.screen === 'mode-select' && <ModeSelectScreen engineRef={engineRef} />}
        {snapshot.screen === 'place' && (
          <PlaceFingersScreen fingerCount={snapshot.fingerCount} countdown={snapshot.countdown} modeMeta={pendingModeMeta} />
        )}
        {snapshot.screen === 'game' && <GameScreen snapshot={snapshot} engineRef={engineRef} />}
      </div>

      {needsOrientationWarning && <OrientationWarning modeMeta={pendingModeMeta} />}
    </div>
  );
}
