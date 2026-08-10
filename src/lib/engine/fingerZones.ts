import { FINGER_NAMES, FINGERS_PER_HAND, LEFT_COLORS, RIGHT_COLORS } from './constants';
import type { FingerZone, TouchPoint } from './types';

/**
 * Splits touch points into left/right hands by x-position and locks them
 * into stable finger zones, ordered index->thumb per hand (left) / thumb->
 * index (right) — so the two "F G | H J" columns read left to right across
 * the gap. Missing fingers are padded so desktop testing with fewer touches
 * still produces a full layout.
 */
export function lockFingerZones(
  points: TouchPoint[],
  width: number,
  height: number,
  fingersPerHand: number = FINGERS_PER_HAND,
): FingerZone[] {
  const sorted = [...points].sort((a, b) => a.x - b.x);
  const midX = width / 2;

  const left = sorted.filter((p) => p.x < midX).slice(0, fingersPerHand);
  const right = sorted.filter((p) => p.x >= midX).slice(0, fingersPerHand);

  while (left.length < fingersPerHand) left.push({ x: 80 + left.length * 30, y: height * 0.7 });
  while (right.length < fingersPerHand) right.push({ x: width - 80 - right.length * 30, y: height * 0.7 });

  left.sort((a, b) => a.x - b.x);
  right.sort((a, b) => a.x - b.x);

  const zones: FingerZone[] = [];
  const lastIdx = fingersPerHand - 1;

  left.forEach((p, i) => {
    zones.push({
      x: p.x,
      y: p.y,
      color: LEFT_COLORS[i] ?? LEFT_COLORS[LEFT_COLORS.length - 1],
      name: `${FINGER_NAMES[i] ?? FINGER_NAMES[FINGER_NAMES.length - 1]} (L)`,
      side: 'left',
      localIdx: i,
      globalIdx: i,
    });
  });

  right.forEach((p, i) => {
    const nameIdx = lastIdx - i;
    zones.push({
      x: p.x,
      y: p.y,
      color: RIGHT_COLORS[i] ?? RIGHT_COLORS[RIGHT_COLORS.length - 1],
      name: `${FINGER_NAMES[nameIdx] ?? FINGER_NAMES[0]} (R)`,
      side: 'right',
      localIdx: i,
      globalIdx: i + fingersPerHand,
    });
  });

  return zones;
}
