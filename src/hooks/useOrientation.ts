'use client';

import { useEffect, useState } from 'react';

/** True when a mobile device is being held in portrait — KIMIKO needs landscape. */
export function useOrientationWarning() {
  const [needsWarning, setNeedsWarning] = useState(false);

  useEffect(() => {
    const check = () => {
      const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
      if (!isMobile) {
        setNeedsWarning(false);
        return;
      }
      setNeedsWarning(window.innerWidth <= window.innerHeight);
    };

    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  return needsWarning;
}
