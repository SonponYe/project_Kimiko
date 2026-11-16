'use client';

import { useRef } from 'react';
import GameOverScreen from '@/components/screens/GameOverScreen';
import IntroScreen from '@/components/screens/IntroScreen';
import PauseScreen from '@/components/screens/PauseScreen';
import { useRacerEngine } from '@/hooks/useRacerEngine';
import RacerCanvas from './RacerCanvas';
import RacerHud from './RacerHud';

export default function GameRoot() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { engineRef, snapshot } = useRacerEngine(canvasRef);

  return (
    <div className="relative h-dvh w-dvw overflow-hidden bg-kimiko-bg text-kimiko-fg">
      <RacerCanvas canvasRef={canvasRef} engineRef={engineRef} />

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        {snapshot.screen === 'intro' && <IntroScreen engineRef={engineRef} best={snapshot.best} />}
        {snapshot.screen === 'game' && (
          <RacerHud
            engineRef={engineRef}
            score={snapshot.score}
            best={snapshot.best}
            phase={snapshot.phase}
            powerups={snapshot.powerups}
          />
        )}
      </div>

      {snapshot.screen === 'game' && snapshot.paused && <PauseScreen engineRef={engineRef} />}
      {snapshot.screen === 'gameover' && (
        <GameOverScreen engineRef={engineRef} score={snapshot.score} best={snapshot.best} newBest={snapshot.newBest} />
      )}
    </div>
  );
}
