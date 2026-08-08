import type { Particle, Ring } from './types';

export function createParticles(x: number, y: number, color: string, count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 4;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.02 + Math.random() * 0.03,
      size: 2 + Math.random() * 4,
      color,
    });
  }
  return particles;
}

/** Advances and draws particles in place, returning the still-alive subset. */
export function stepParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): Particle[] {
  const alive = particles.filter((p) => p.life > 0);

  for (const p of alive) {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.94;
    p.vy *= 0.94;
    p.life -= p.decay;

    ctx.save();
    ctx.globalAlpha = Math.max(p.life, 0);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * Math.max(p.life, 0), 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.restore();
  }

  return alive;
}

export function createRing(x: number, y: number, color: string): Ring {
  return { x, y, r: 30, life: 1, color };
}

/** Advances and draws expanding pulse rings, returning the still-alive subset. */
export function stepRings(ctx: CanvasRenderingContext2D, rings: Ring[]): Ring[] {
  const alive = rings.filter((r) => r.life > 0);

  for (const r of alive) {
    r.life -= 1 / 36; // ~0.6s at 60fps
    const scale = 1 + (1 - r.life) * 1.5; // grows 1x -> 2.5x as it fades

    ctx.save();
    ctx.globalAlpha = Math.max(r.life, 0) * 0.8;
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.r * scale, 0, Math.PI * 2);
    ctx.strokeStyle = r.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  return alive;
}
