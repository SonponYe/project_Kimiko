'use client';

import { useEffect, useState } from 'react';

/**
 * The browser/OS-reported ceiling on simultaneous touch points. Many phones
 * (most iPhones especially) cap this well below 10 at the hardware level —
 * `null` until measured client-side, since it's meaningless during SSR.
 */
export function useMaxTouchPoints(): number | null {
  const [max, setMax] = useState<number | null>(null);

  useEffect(() => {
    // Start with the browser-reported ceiling when available.
    const reported = typeof navigator !== 'undefined' ? navigator.maxTouchPoints : null;
    setMax(reported);

    // Also listen for real touch events to detect a higher practical
    // simultaneous-touch count. Some browsers/devices report a low
    // `navigator.maxTouchPoints`, while the actual digitizer supports more.
    const onTouchStart = (e: TouchEvent) => {
      const len = e.touches?.length ?? 0;
      setMax((cur) => (cur === null ? len : Math.max(cur, len)));
    };

    // Pointer events can also indicate touch usage on some platforms.
    const onPointerDown = (e: PointerEvent) => {
      if ((e as any).pointerType === 'touch') {
        // Count active pointers by querying current touch points if available.
        // `navigator.maxTouchPoints` is a fallback; we only increase the
        // measured value when we observe concurrent touches.
        const active = (navigator as any).maxTouchPoints || 1;
        setMax((cur) => (cur === null ? active : Math.max(cur, active)));
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('pointerdown', onPointerDown);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  return max;
}
