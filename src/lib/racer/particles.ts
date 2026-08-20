import { RACER_COLORS } from './constants';
import type { Particle } from './types';

export function burst(x: number, y: number, count: number, color: string = RACER_COLORS.particle): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 220;
    out.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.9 + Math.random() * 0.6,
      size: 2 + Math.random() * 3,
      color,
    });
  }
  return out;
}

export function stepParticles(ctx: CanvasRenderingContext2D, particles: Particle[], dt: number): Particle[] {
  const alive: Particle[] = [];
  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.92;
    p.vy *= 0.92;
    p.life -= p.decay * dt;
    if (p.life <= 0) continue;
    alive.push(p);

    ctx.save();
    ctx.globalAlpha = Math.max(p.life, 0);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * Math.max(p.life, 0.2), 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.restore();
  }
  return alive;
}
