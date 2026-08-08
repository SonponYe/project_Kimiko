'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { KimikoEngine } from '@/lib/engine/KimikoEngine';
import type { EngineSnapshot } from '@/lib/engine/types';

const DEFAULT_SNAPSHOT: EngineSnapshot = {
  screen: 'intro',
  fingerCount: 0,
  fingerZonesLocked: false,
  mode: null,
  score: 0,
  combo: 1,
  typedDisplay: null,
  promptLetter: '',
  flash: null,
};

export function useKimikoEngine(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const engineRef = useRef<KimikoEngine | null>(null);
  const [snapshot, setSnapshot] = useState<EngineSnapshot>(DEFAULT_SNAPSHOT);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new KimikoEngine(canvas);
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
