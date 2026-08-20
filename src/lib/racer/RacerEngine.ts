import {
  BASE_SPAWN_MS,
  BASE_SPEED,
  BEST_SCORE_KEY,
  HIT_BAND,
  LANE_COUNT,
  MAX_SPEED,
  MIN_SPAWN_MS,
  OBSTACLE_HALF,
  ORB_RADIUS,
  ORB_SCORE,
  PHASE_DURATION_MS,
  PLAYER_RADIUS,
  PLAYER_Y_RATIO,
  RACER_COLORS,
  SCORE_PER_SEC,
  SPEED_RAMP_PER_SEC,
} from './constants';
import { burst, stepParticles } from './particles';
import type { Obstacle, Orb, Particle, Phase, RacerSnapshot, ScreenId } from './types';

type Listener = (snapshot: RacerSnapshot) => void;

function laneX(lane: number, width: number): number {
  return width * ((lane + 0.5) / LANE_COUNT);
}

function loadBest(): number {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem(BEST_SCORE_KEY);
  return raw ? Number(raw) || 0 : 0;
}

/**
 * A standard 3-lane runner — no finger counting anywhere. The one twist:
 * the player's ghost automatically alternates Solid / Spectral. Solid can
 * collide with obstacles and collect orbs; Spectral passes through
 * everything harmlessly but can't score. Survival means reading the phase
 * clock and your lane choice together, not just dodging.
 */
export class RacerEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;

  private screen: ScreenId = 'intro';
  private lane = 1;
  private displayX = 0;

  private phase: Phase = 'solid';
  private phaseElapsed = 0;

  private obstacles: Obstacle[] = [];
  private orbs: Orb[] = [];
  private particles: Particle[] = [];
  private nextId = 0;

  private score = 0;
  private best = 0;
  private elapsedMs = 0;
  private nextSpawnAt = 0;
  private alive = false;

  private raf: number | null = null;
  private lastTs: number | null = null;
  private listeners = new Set<Listener>();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('RacerEngine: 2D canvas context is unavailable');
    this.ctx = ctx;
    this.best = loadBest();
  }

  // ---- Lifecycle ----

  start() {
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy() {
    if (this.raf !== null) cancelAnimationFrame(this.raf);
    this.listeners.clear();
  }

  resize(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;
    this.displayX = laneX(this.lane, this.width);
  }

  // ---- Subscription ----

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((l) => l(snapshot));
  }

  private getSnapshot(): RacerSnapshot {
    return {
      screen: this.screen,
      score: Math.floor(this.score),
      best: Math.floor(this.best),
      phase: this.phase,
      phaseProgress: 1 - this.phaseElapsed / PHASE_DURATION_MS,
    };
  }

  // ---- Screens ----

  showIntro() {
    this.screen = 'intro';
    this.notify();
  }

  startGame() {
    this.lane = 1;
    this.displayX = laneX(this.lane, this.width);
    this.phase = 'solid';
    this.phaseElapsed = 0;
    this.obstacles = [];
    this.orbs = [];
    this.particles = [];
    this.score = 0;
    this.elapsedMs = 0;
    this.nextSpawnAt = BASE_SPAWN_MS;
    this.alive = true;
    this.screen = 'game';
    this.notify();
  }

  restart() {
    this.startGame();
  }

  // ---- Input ----

  moveLane(dir: -1 | 1) {
    if (this.screen !== 'game' || !this.alive) return;
    this.lane = Math.max(0, Math.min(LANE_COUNT - 1, this.lane + dir));
  }

  // ---- Simulation ----

  private spawn() {
    const lane = Math.floor(Math.random() * LANE_COUNT);
    // Occasionally drop an orb instead of an obstacle so scoring isn't purely passive.
    if (Math.random() < 0.35) {
      this.orbs.push({ id: this.nextId++, lane, y: -30, taken: false });
    } else {
      this.obstacles.push({ id: this.nextId++, lane, y: -30, passed: false });
    }
  }

  private endGame() {
    this.alive = false;
    this.screen = 'gameover';
    if (this.score > this.best) {
      this.best = this.score;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(BEST_SCORE_KEY, String(Math.floor(this.best)));
      }
    }
    const px = laneX(this.lane, this.width);
    const py = this.height * PLAYER_Y_RATIO;
    this.particles.push(...burst(px, py, 26, RACER_COLORS.playerSolid));
    this.notify();
  }

  private update(dt: number) {
    const speed = Math.min(MAX_SPEED, BASE_SPEED + (this.elapsedMs / 1000) * SPEED_RAMP_PER_SEC);
    this.elapsedMs += dt * 1000;
    this.score += SCORE_PER_SEC * dt;

    // Phase clock
    this.phaseElapsed += dt * 1000;
    if (this.phaseElapsed >= PHASE_DURATION_MS) {
      this.phaseElapsed = 0;
      this.phase = this.phase === 'solid' ? 'spectral' : 'solid';
    }

    // Smooth lane tween
    const targetX = laneX(this.lane, this.width);
    this.displayX += (targetX - this.displayX) * Math.min(1, dt * 12);

    // Spawning
    if (this.elapsedMs >= this.nextSpawnAt) {
      this.spawn();
      const interval = Math.max(MIN_SPAWN_MS, BASE_SPAWN_MS - (this.elapsedMs / 1000) * 14);
      this.nextSpawnAt = this.elapsedMs + interval;
    }

    const playerY = this.height * PLAYER_Y_RATIO;
    const dy = speed * dt;

    // Obstacles
    this.obstacles = this.obstacles.filter((o) => {
      o.y += dy;
      if (o.y > this.height + 60) return false;
      if (!o.passed && o.lane === this.lane && Math.abs(o.y - playerY) < HIT_BAND) {
        o.passed = true;
        if (this.phase === 'solid') {
          this.endGame();
        } else {
          this.particles.push(...burst(laneX(o.lane, this.width), o.y, 8, RACER_COLORS.obstacleGlow));
        }
      }
      return true;
    });

    // Orbs
    this.orbs = this.orbs.filter((orb) => {
      orb.y += dy;
      if (orb.y > this.height + 40) return false;
      if (!orb.taken && orb.lane === this.lane && Math.abs(orb.y - playerY) < HIT_BAND) {
        orb.taken = true;
        if (this.phase === 'solid') {
          this.score += ORB_SCORE;
          this.particles.push(...burst(laneX(orb.lane, this.width), orb.y, 14, RACER_COLORS.orbCore));
        }
        return false;
      }
      return true;
    });
  }

  // ---- Render loop ----

  private loop = (ts: number) => {
    const dt = this.lastTs === null ? 0 : Math.min(0.05, (ts - this.lastTs) / 1000);
    this.lastTs = ts;

    if (this.screen === 'game' && this.alive) {
      this.update(dt);
      this.notify();
    }

    this.render(ts * 0.001, dt);
    this.raf = requestAnimationFrame(this.loop);
  };

  private render(t: number, dt: number) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.fillStyle = this.screen === 'game' && this.alive ? RACER_COLORS.trail : RACER_COLORS.bg;
    ctx.fillRect(0, 0, w, h);

    this.drawLanes(t);

    if (this.screen === 'game' || this.screen === 'gameover') {
      this.drawOrbs();
      this.drawObstacles();
      this.drawPlayer();
    }

    this.particles = stepParticles(ctx, this.particles, dt);
  }

  private drawLanes(t: number) {
    const ctx = this.ctx;
    for (let i = 1; i < LANE_COUNT; i++) {
      const x = (this.width / LANE_COUNT) * i;
      ctx.save();
      ctx.strokeStyle = RACER_COLORS.laneLine;
      ctx.lineWidth = 1;
      ctx.setLineDash([10, 14]);
      ctx.lineDashOffset = -t * 40;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
      ctx.restore();
    }
  }

  private drawObstacles() {
    const ctx = this.ctx;
    for (const o of this.obstacles) {
      const x = laneX(o.lane, this.width);
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, o.y, OBSTACLE_HALF + 10, 0, Math.PI * 2);
      ctx.fillStyle = RACER_COLORS.obstacleGlow;
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(x, o.y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = RACER_COLORS.obstacle;
      ctx.fillRect(-OBSTACLE_HALF, -OBSTACLE_HALF, OBSTACLE_HALF * 2, OBSTACLE_HALF * 2);
      ctx.restore();
    }
  }

  private drawOrbs() {
    const ctx = this.ctx;
    for (const orb of this.orbs) {
      const x = laneX(orb.lane, this.width);
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, orb.y, ORB_RADIUS + 6, 0, Math.PI * 2);
      ctx.strokeStyle = RACER_COLORS.orb;
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, orb.y, ORB_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = RACER_COLORS.orbCore;
      ctx.fill();
      ctx.restore();
    }
  }

  private drawPlayer() {
    const ctx = this.ctx;
    const y = this.height * PLAYER_Y_RATIO;
    const isSolid = this.phase === 'solid';

    ctx.save();
    ctx.beginPath();
    ctx.arc(this.displayX, y, PLAYER_RADIUS + 12, 0, Math.PI * 2);
    ctx.strokeStyle = isSolid ? RACER_COLORS.playerSolid : RACER_COLORS.playerSpectral;
    ctx.globalAlpha = isSolid ? 0.35 : 0.6;
    ctx.lineWidth = 1.5;
    ctx.setLineDash(isSolid ? [] : [3, 5]);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(this.displayX, y, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = isSolid ? RACER_COLORS.playerSolid : RACER_COLORS.playerSpectral;
    ctx.fill();
    ctx.restore();
  }
}
