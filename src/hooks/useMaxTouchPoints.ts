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
    setMax(typeof navigator !== 'undefined' ? navigator.maxTouchPoints : null);
  }, []);

  return max;
}
