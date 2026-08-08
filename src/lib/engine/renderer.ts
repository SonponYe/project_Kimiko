import { CANVAS_COLORS, LETTER_MAP } from './constants';
import type { DodgeObject, FingerZone, TouchPoint } from './types';

export function clearFrame(ctx: CanvasRenderingContext2D, w: number, h: number, trail: boolean) {
  ctx.fillStyle = trail ? CANVAS_COLORS.trail : CANVAS_COLORS.bg;
  ctx.fillRect(0, 0, w, h);
}

export function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.strokeStyle = CANVAS_COLORS.gridLine;
  ctx.lineWidth = 0.5;
  const step = 48;
  for (let x = 0; x < w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawFingerZones(
  ctx: CanvasRenderingContext2D,
  zones: FingerZone[],
  activeTouches: Map<number, TouchPoint>,
  t: number,
) {
  if (!zones.length) return;
  const touches = Array.from(activeTouches.values());

  zones.forEach((z, i) => {
    const isActive = touches.some((t2) => Math.hypot(t2.x - z.x, t2.y - z.y) < 60);
    // Slow breathing pulse on the outer ring, offset per finger so the whole
    // hand doesn't beat in lockstep.
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.4 + i * 0.6);
    const ringRadius = 32 + (isActive ? pulse * 2 : pulse * 1);

    ctx.save();
    ctx.beginPath();
    ctx.arc(z.x, z.y, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = isActive ? z.color : `${z.color}55`;
    ctx.lineWidth = isActive ? 2 : 1;
    ctx.globalAlpha = isActive ? 1 : 0.55 + pulse * 0.35;
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.beginPath();
    ctx.arc(z.x, z.y, 22, 0, Math.PI * 2);
    ctx.fillStyle = z.color + (isActive ? '33' : '11');
    ctx.fill();

    const letter = LETTER_MAP[i];
    if (letter) {
      ctx.fillStyle = isActive ? z.color : `${z.color}aa`;
      ctx.font = `${isActive ? 600 : 400} 14px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter, z.x, z.y);
    }

    ctx.fillStyle = `${z.color}66`;
    ctx.font = '9px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(z.name, z.x, z.y + 26);
    ctx.restore();
  });
}

export function drawActiveTouches(ctx: CanvasRenderingContext2D, activeTouches: Map<number, TouchPoint>) {
  activeTouches.forEach((t) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(t.x, t.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = CANVAS_COLORS.touchDot;
    ctx.fill();
    ctx.restore();
  });
}

export function drawDodgeObject(ctx: CanvasRenderingContext2D, o: DodgeObject, target?: FingerZone) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
  const gradient = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.radius);
  gradient.addColorStop(0, '#e4767c');
  gradient.addColorStop(1, `${CANVAS_COLORS.danger}33`);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.restore();

  if (!target) return;

  ctx.save();
  ctx.setLineDash([4, 8]);
  ctx.strokeStyle = `${CANVAS_COLORS.danger}22`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(o.x, o.y);
  ctx.lineTo(target.x, target.y);
  ctx.stroke();
  ctx.restore();
}

export function drawIdleBackground(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  ctx.fillStyle = CANVAS_COLORS.idleFade;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 5; i++) {
    const x = w * (0.15 + i * 0.18);
    const y = h * 0.5 + Math.sin(t + i * 1.2) * 30;
    const r = 20 + Math.sin(t * 0.7 + i) * 8;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(111,168,255,${0.1 + 0.05 * Math.sin(t + i)})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  for (let i = 0; i < 5; i++) {
    const x = w * (0.5 + i * 0.1);
    const y = h * 0.5 + Math.sin(t * 0.8 + i * 1.5) * 25;
    const r = 18 + Math.sin(t + i * 2) * 7;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(143,224,232,${0.08 + 0.04 * Math.sin(t + i)})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
}
