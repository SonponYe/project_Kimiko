'use client';

import { useEffect, useState } from 'react';

function isPortraitNow(): boolean {
  // The Screen Orientation API reflects the OS's own rotation state, which
  // is more reliable than a viewport-size guess (browser chrome, on-screen
  // keyboards, and resize timing can all throw width/height off).
  const orientationType = typeof screen !== 'undefined' ? screen.orientation?.type : undefined;
  if (orientationType) return orientationType.startsWith('portrait');
  return window.innerWidth <= window.innerHeight;
}

/** True when a mobile device is currently held in portrait — KIMIKO needs landscape. */
export function useIsPortrait() {
  const [portrait, setPortrait] = useState(false);

  useEffect(() => {
    const check = () => {
      const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
      setPortrait(isMobile && isPortraitNow());
    };

    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    screen.orientation?.addEventListener?.('change', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
      screen.orientation?.removeEventListener?.('change', check);
    };
  }, []);

  return portrait;
}
