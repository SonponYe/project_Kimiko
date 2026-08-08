'use client';

import { useEffect, type RefObject } from 'react';
import type { KimikoEngine } from '@/lib/engine/KimikoEngine';

interface GameCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  engineRef: RefObject<KimikoEngine | null>;
}

const MOUSE_TOUCH_ID = -1;

export default function GameCanvas({ canvasRef, engineRef }: GameCanvasProps) {
  useEffect(() => {
    const canvas = canvasRef.current;

    const handleResize = () => {
      engineRef.current?.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      for (const t of Array.from(e.changedTouches)) {
        engineRef.current?.handleTouchStart(t.identifier, t.clientX, t.clientY);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      for (const t of Array.from(e.changedTouches)) {
        engineRef.current?.handleTouchMove(t.identifier, t.clientX, t.clientY);
      }
    };
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      for (const t of Array.from(e.changedTouches)) {
        engineRef.current?.handleTouchEnd(t.identifier, t.clientX, t.clientY);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    // Desktop testing: mouse acts as a single simulated finger.
    let mouseDown = false;
    const handleMouseDown = (e: MouseEvent) => {
      mouseDown = true;
      engineRef.current?.handleTouchStart(MOUSE_TOUCH_ID, e.clientX, e.clientY);
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseDown) engineRef.current?.handleTouchMove(MOUSE_TOUCH_ID, e.clientX, e.clientY);
    };
    const handleMouseUp = (e: MouseEvent) => {
      if (!mouseDown) return;
      mouseDown = false;
      engineRef.current?.handleTouchEnd(MOUSE_TOUCH_ID, e.clientX, e.clientY);
    };

    canvas?.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      canvas?.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [canvasRef, engineRef]);

  return <canvas ref={canvasRef} className="fixed inset-0 h-full w-full touch-none" />;
}
