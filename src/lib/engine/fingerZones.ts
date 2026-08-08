import { FINGER_NAMES, LEFT_COLORS, RIGHT_COLORS } from './constants';
import type { FingerZone, TouchPoint } from './types';

/**
 * Splits up to 10 touch points into left/right hands by x-position and locks
 * them into stable finger zones, ordered pinky->thumb per hand (indices 0-4
 * left, 5-9 right). Missing fingers are padded so desktop testing with fewer
 * than 10 touches still produces a full 10-zone layout.
 */
export function lockFingerZones(points: TouchPoint[], width: number, height: number): FingerZone[] {
  const sorted = [...points].sort((a, b) => a.x - b.x);
  const midX = width / 2;

  const left = sorted.filter((p) => p.x < midX).slice(0, 5);
  const right = sorted.filter((p) => p.x >= midX).slice(0, 5);

  while (left.length < 5) left.push({ x: 80 + left.length * 30, y: height * 0.7 });
  while (right.length < 5) right.push({ x: width - 80 - right.length * 30, y: height * 0.7 });

  left.sort((a, b) => a.x - b.x);
  right.sort((a, b) => a.x - b.x);

  const zones: FingerZone[] = [];

  left.forEach((p, i) => {
    zones.push({
      x: p.x,
      y: p.y,
      color: LEFT_COLORS[i],
      name: `${FINGER_NAMES[i]} (L)`,
      side: 'left',
      localIdx: i,
      globalIdx: i,
    });
  });

  right.forEach((p, i) => {
    zones.push({
      x: p.x,
      y: p.y,
      color: RIGHT_COLORS[i],
      name: `${FINGER_NAMES[4 - i]} (R)`,
      side: 'right',
      localIdx: i,
      globalIdx: i + 5,
    });
  });

  return zones;
}
