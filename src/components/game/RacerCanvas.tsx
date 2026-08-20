'use client';

import { useEffect, type RefObject } from 'react';
import type { RacerEngine } from '@/lib/racer/RacerEngine';

interface RacerCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  engineRef: RefObject<RacerEngine | null>;
}

// A tap's target is fixed to whatever element it started on. Skip UI
// controls (buttons) so their native tap/click still fires — otherwise
// preventDefault() below would suppress it, same lesson as the old touch
// bug: buttons need to be left alone by the game's own input handling.
function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('button, a, [role="button"]') !== null;
}

export default function RacerCanvas({ canvasRef, engineRef }: RacerCanvasProps) {
  useEffect(() => {
    const canvas = canvasRef.current;

    const handleResize = () => {
      engineRef.current?.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Tap the left or right half of the screen to change lanes — a single
    // decisive tap per lane change, like any normal lane-runner.
    const laneFromX = (x: number) => (x < window.innerWidth / 2 ? -1 : 1);

    const handleTouchStart = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (!t || isInteractiveTarget(t.target)) return;
      e.preventDefault();
      engineRef.current?.moveLane(laneFromX(t.clientX));
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (isInteractiveTarget(e.target)) return;
      engineRef.current?.moveLane(laneFromX(e.clientX));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') engineRef.current?.moveLane(-1);
      if (e.key === 'ArrowRight' || e.key === 'd') engineRef.current?.moveLane(1);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    canvas?.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('keydown', handleKeyDown);
      canvas?.removeEventListener('mousedown', handleMouseDown);
    };
  }, [canvasRef, engineRef]);

  return <canvas ref={canvasRef} className="fixed inset-0 h-full w-full touch-none" />;
}
