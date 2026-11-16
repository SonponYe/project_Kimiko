'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { RacerEngine } from '@/lib/racer/RacerEngine';
import type { RacerSnapshot } from '@/lib/racer/types';

const DEFAULT_SNAPSHOT: RacerSnapshot = {
  screen: 'intro',
  paused: false,
  score: 0,
  best: 0,
  newBest: false,
  phase: 'solid',
  powerups: [],
};

export function useRacerEngine(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const engineRef = useRef<RacerEngine | null>(null);
  const [snapshot, setSnapshot] = useState<RacerSnapshot>(DEFAULT_SNAPSHOT);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new RacerEngine(canvas);
    engineRef.current = engine;
    engine.resize(window.innerWidth, window.innerHeight);

    const unsubscribe = engine.subscribe(setSnapshot);
    engine.start();

    return () => {
      unsubscribe();
      engine.destroy();
      engineRef.current = null;
    };
  }, [canvasRef]);

  return { engineRef, snapshot };
}
