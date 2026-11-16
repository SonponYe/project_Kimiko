import {
  BASE_SPAWN_MS,
  BASE_SPEED,
  BEST_SCORE_KEY,
  DEATH_DELAY_MS,
  DOUBLE_ROW_AFTER_S,
  FIRST_PICKUP_MS,
  HIT_BAND,
  LANE_COUNT,
  MAGNET_RANGE,
  MAX_SPEED,
  MIN_SPAWN_MS,
  OBSTACLE_HALF,
  ORB_RADIUS,
  ORB_SCORE,
  PHASE_DURATION_MS,
  PHASE_WARNING_MS,
  PICKUP_GAP_MS,
  PICKUP_RADIUS,
  PICKUP_SCORE,
  PLAYER_RADIUS,
  PLAYER_Y_RATIO,
  POWER_DURATION_MS,
  POWER_LABEL,
  RACER_COLORS,
  SCORE_PER_SEC,
  SHIELD_GRACE_S,
  SLOW_SCALE,
  SPEED_RAMP_PER_SEC,
} from './constants';
import { burst, stepParticles } from './particles';
import type {
  Obstacle,
  Orb,
  Particle,
  Phase,
  Pickup,
  PowerKind,
  Popup,
  RacerLive,
  RacerSnapshot,
  ScreenId,
} from './types';

type Listener = (snapshot: RacerSnapshot) => void;
type TimedPower = Exclude<PowerKind, 'shield'>;

const POWER_KINDS: PowerKind[] = ['shield', 'magnet', 'slow', 'double'];
const SOLID_RGB = '234,232,228';
const SPAWN_Y = -30;

function laneX(lane: number, width: number): number {
  return width * ((lane + 0.5) / LANE_COUNT);
}

function loadBest(): number {
  try {
    const raw = window.localStorage.getItem(BEST_SCORE_KEY);
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

function saveBest(value: number) {
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(Math.floor(value)));
  } catch {
    /* storage unavailable (private mode): best just won't persist */
  }
}

function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}

/** Frame-rate independent exponential smoothing factor. */
function damp(rate: number, dt: number): number {
  return 1 - Math.exp(-rate * dt);
}

/**
 * A 3-lane runner. The ghost automatically alternates Solid / Spectral.
 * Solid collides with obstacles and collects orbs and power-ups; Spectral
 * passes through everything harmlessly but can't score. Survival means
 * reading the phase clock and your lane together.
 */
export class RacerEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private dpr = 1;

  private screen: ScreenId = 'intro';
  private paused = false;
  private lane = 1;
  private displayX = 0;
  private tilt = 0;

  private phase: Phase = 'solid';
  private phaseElapsed = 0;
  /** Smoothed 1 = fully solid, 0 = fully spectral. Drives every phase visual. */
  private blend = 1;
  private phasePulse = 0;

  private obstacles: Obstacle[] = [];
  private orbs: Orb[] = [];
  private pickups: Pickup[] = [];
  private particles: Particle[] = [];
  private popups: Popup[] = [];
  private nextId = 0;

  private score = 0;
  private best = 0;
  private newBest = false;
  private elapsedMs = 0;
  private nextSpawnAt = 0;
  private nextPickupAt = 0;
  private alive = false;
  private deathTimer = 0;
  private speed = BASE_SPEED;

  // Power-ups
  private shield = false;
  private invuln = 0; // seconds
  private timers: Record<TimedPower, number> = { magnet: 0, slow: 0, double: 0 };
  private timeScale = 1;

  // Feel
  private shake = 0;
  private flash = 0;
  private streaks = Array.from({ length: 22 }, () => ({
    x: Math.random(),
    y: Math.random(),
    len: 0.04 + Math.random() * 0.09,
    a: 0.03 + Math.random() * 0.07,
  }));

  private raf: number | null = null;
  private lastTs: number | null = null;
  private listeners = new Set<Listener>();
  private lastKey = '';

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
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.displayX = laneX(this.lane, this.width);
  }

  // ---- Subscription ----

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private activePowerups(): PowerKind[] {
    const out: PowerKind[] = [];
    if (this.shield) out.push('shield');
    if (this.timers.magnet > 0) out.push('magnet');
    if (this.timers.slow > 0) out.push('slow');
    if (this.timers.double > 0) out.push('double');
    return out;
  }

  private getSnapshot(): RacerSnapshot {
    return {
      screen: this.screen,
      paused: this.paused,
      score: Math.floor(this.score),
      best: Math.floor(this.best),
      newBest: this.newBest,
      phase: this.phase,
      powerups: this.activePowerups(),
    };
  }

  /** Emits only when something the React UI displays has changed. */
  private notify() {
    const s = this.getSnapshot();
    const key = `${s.screen}|${s.paused}|${s.score}|${s.best}|${s.newBest}|${s.phase}|${s.powerups.join(',')}`;
    if (key === this.lastKey) return;
    this.lastKey = key;
    this.listeners.forEach((l) => l(s));
  }

  /** Polled by the HUD every animation frame for smooth bars. */
  getLive(): RacerLive {
    const remaining = PHASE_DURATION_MS - this.phaseElapsed;
    return {
      phaseProgress: 1 - this.phaseElapsed / PHASE_DURATION_MS,
      phaseWarning: this.screen === 'game' && this.alive && remaining < PHASE_WARNING_MS,
      powerFill: {
        shield: this.shield ? 1 : 0,
        magnet: this.timers.magnet / POWER_DURATION_MS.magnet,
        slow: this.timers.slow / POWER_DURATION_MS.slow,
        double: this.timers.double / POWER_DURATION_MS.double,
      },
    };
  }

  // ---- Screens ----

  showIntro() {
    this.screen = 'intro';
    this.paused = false;
    this.alive = false;
    this.obstacles = [];
    this.orbs = [];
    this.pickups = [];
    this.popups = [];
    this.notify();
  }

  startGame() {
    this.lane = 1;
    this.displayX = laneX(this.lane, this.width);
    this.tilt = 0;
    this.phase = 'solid';
    this.phaseElapsed = 0;
    this.blend = 1;
    this.phasePulse = 0;
    this.obstacles = [];
    this.orbs = [];
    this.pickups = [];
    this.particles = [];
    this.popups = [];
    this.score = 0;
    this.newBest = false;
    this.elapsedMs = 0;
    this.nextSpawnAt = BASE_SPAWN_MS;
    this.nextPickupAt = FIRST_PICKUP_MS;
    this.speed = BASE_SPEED;
    this.shield = false;
    this.invuln = 0;
    this.timers = { magnet: 0, slow: 0, double: 0 };
    this.timeScale = 1;
    this.shake = 0;
    this.flash = 0;
    this.deathTimer = 0;
    this.paused = false;
    this.alive = true;
    this.screen = 'game';
    this.notify();
  }

  restart() {
    this.startGame();
  }

  // ---- Pause ----

  pause() {
    if (this.screen !== 'game' || !this.alive || this.paused) return;
    this.paused = true;
    this.notify();
  }

  resume() {
    if (!this.paused) return;
    this.paused = false;
    this.notify();
  }

  togglePause() {
    if (this.paused) this.resume();
    else this.pause();
  }

  /** Space / Enter: start, retry or resume depending on where we are. */
  primaryAction() {
    if (this.screen === 'intro') this.startGame();
    else if (this.screen === 'gameover') this.restart();
    else if (this.paused) this.resume();
  }

  // ---- Input ----

  moveLane(dir: -1 | 1) {
    if (this.screen !== 'game' || !this.alive || this.paused) return;
    const next = Math.max(0, Math.min(LANE_COUNT - 1, this.lane + dir));
    if (next === this.lane) {
      // Edge bump: a small nudge so the tap still feels registered.
      this.tilt += dir * 0.35;
      return;
    }
    this.lane = next;
  }

  // ---- Spawning ----

  private spawnRow() {
    const t = this.elapsedMs / 1000;
    const r = Math.random();
    const lane = Math.floor(Math.random() * LANE_COUNT);

    if (t > DOUBLE_ROW_AFTER_S && r < 0.2) {
      // Two obstacles, one lane always left open.
      for (let l = 0; l < LANE_COUNT; l++) {
        if (l !== lane) this.obstacles.push({ id: this.nextId++, lane: l, y: SPAWN_Y, passed: false });
      }
    } else if (r < 0.5) {
      // A short chain of orbs in one lane.
      for (let i = 0; i < 3; i++) {
        this.orbs.push({ id: this.nextId++, lane, y: SPAWN_Y - i * 64, taken: false, pull: 0 });
      }
    } else {
      this.obstacles.push({ id: this.nextId++, lane, y: SPAWN_Y, passed: false });
    }
  }

  private spawnPickup() {
    const kind = POWER_KINDS[Math.floor(Math.random() * POWER_KINDS.length)];
    const lane = Math.floor(Math.random() * LANE_COUNT);
    // Offset so it never sits on top of a freshly spawned row.
    this.pickups.push({ id: this.nextId++, lane, y: SPAWN_Y - this.speed * 0.3, kind, taken: false });
  }

  // ---- Effects ----

  private popup(x: number, y: number, text: string) {
    this.popups.push({ x, y, text, life: 1 });
  }

  private collectPickup(p: Pickup) {
    const x = laneX(p.lane, this.width);
    this.score += PICKUP_SCORE * (this.timers.double > 0 ? 2 : 1);
    if (p.kind === 'shield') this.shield = true;
    else this.timers[p.kind] = POWER_DURATION_MS[p.kind];
    this.particles.push(...burst(x, p.y, 18, RACER_COLORS.orbCore));
    this.popup(x, p.y - 18, POWER_LABEL[p.kind]);
    vibrate(18);
  }

  private breakShield(o: Obstacle) {
    this.shield = false;
    this.invuln = SHIELD_GRACE_S;
    this.shake = Math.max(this.shake, 9);
    this.flash = 0.18;
    const x = laneX(o.lane, this.width);
    this.particles.push(...burst(x, o.y, 24, RACER_COLORS.orbCore));
    this.popup(x, o.y - 24, 'Shield broken');
    vibrate([20, 30, 20]);
  }

  private endGame() {
    if (!this.alive) return;
    this.alive = false;
    this.deathTimer = DEATH_DELAY_MS / 1000;
    this.shake = 14;
    this.flash = 0.3;
    this.newBest = this.score > this.best;
    if (this.newBest) {
      this.best = this.score;
      saveBest(this.best);
    }
    const py = this.height * PLAYER_Y_RATIO;
    this.particles.push(...burst(this.displayX, py, 34, RACER_COLORS.playerSolid));
    vibrate(60);
    this.notify();
  }

  // ---- Simulation ----

  private update(realDt: number) {
    // Slow-mo eases in and out instead of snapping.
    const targetScale = this.timers.slow > 0 ? SLOW_SCALE : 1;
    this.timeScale += (targetScale - this.timeScale) * damp(7, realDt);
    const dt = realDt * this.timeScale;

    (Object.keys(this.timers) as TimedPower[]).forEach((k) => {
      if (this.timers[k] > 0) this.timers[k] = Math.max(0, this.timers[k] - realDt * 1000);
    });
    this.invuln = Math.max(0, this.invuln - realDt);

    this.speed = Math.min(MAX_SPEED, BASE_SPEED + (this.elapsedMs / 1000) * SPEED_RAMP_PER_SEC);
    this.elapsedMs += dt * 1000;
    const mult = this.timers.double > 0 ? 2 : 1;
    this.score += SCORE_PER_SEC * realDt * mult;

    // Phase clock
    this.phaseElapsed += dt * 1000;
    if (this.phaseElapsed >= PHASE_DURATION_MS) {
      this.phaseElapsed -= PHASE_DURATION_MS;
      this.phase = this.phase === 'solid' ? 'spectral' : 'solid';
      this.phasePulse = 1;
    }

    // Spawning
    if (this.elapsedMs >= this.nextSpawnAt) {
      this.spawnRow();
      const interval = Math.max(MIN_SPAWN_MS, BASE_SPAWN_MS - (this.elapsedMs / 1000) * 14);
      this.nextSpawnAt = this.elapsedMs + interval;
    }
    if (this.elapsedMs >= this.nextPickupAt) {
      this.spawnPickup();
      const [lo, hi] = PICKUP_GAP_MS;
      this.nextPickupAt = this.elapsedMs + lo + Math.random() * (hi - lo);
    }

    const playerY = this.height * PLAYER_Y_RATIO;
    const dy = this.speed * dt;
    const solid = this.phase === 'solid';
    const magnet = this.timers.magnet > 0;

    // Obstacles
    this.obstacles = this.obstacles.filter((o) => {
      o.y += dy;
      if (o.y > this.height + 60) return false;
      if (this.alive && !o.passed && o.lane === this.lane && Math.abs(o.y - playerY) < HIT_BAND) {
        o.passed = true;
        if (solid && this.invuln <= 0) {
          if (this.shield) {
            this.breakShield(o);
            return false;
          }
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

      const near = orb.y > playerY - MAGNET_RANGE && orb.y < playerY + HIT_BAND;
      if (magnet && solid && near) orb.pull = Math.min(1, orb.pull + realDt * 3.2);
      else orb.pull = Math.max(0, orb.pull - realDt * 3);

      const sameLaneHit = orb.lane === this.lane && Math.abs(orb.y - playerY) < HIT_BAND;
      const pulledHit = orb.pull >= 0.97 && Math.abs(orb.y - playerY) < HIT_BAND * 1.6;
      if (this.alive && !orb.taken && (sameLaneHit || pulledHit)) {
        orb.taken = true;
        if (solid) {
          const gain = ORB_SCORE * mult;
          this.score += gain;
          const x = orb.pull > 0 ? this.displayX : laneX(orb.lane, this.width);
          this.particles.push(...burst(x, orb.y, 12, RACER_COLORS.orbCore));
          this.popup(x, orb.y - 14, `+${gain}`);
        }
        return false;
      }
      return true;
    });

    // Power-up pickups (solid only, like orbs)
    this.pickups = this.pickups.filter((p) => {
      p.y += dy;
      if (p.y > this.height + 40) return false;
      if (this.alive && !p.taken && p.lane === this.lane && Math.abs(p.y - playerY) < HIT_BAND) {
        p.taken = true;
        if (solid) {
          this.collectPickup(p);
          return false;
        }
        // Spectral: it drifts through you and stays on screen, ghosted.
      }
      return true;
    });
  }

  // ---- Frame loop ----

  private loop = (ts: number) => {
    const rawDt = this.lastTs === null ? 0 : (ts - this.lastTs) / 1000;
    const dt = Math.min(0.05, Math.max(0, rawDt));
    this.lastTs = ts;

    const running = this.screen === 'game' && this.alive && !this.paused;
    if (running) this.update(dt);

    // Death -> game over after a beat, so the burst is actually seen.
    if (this.screen === 'game' && !this.alive && this.deathTimer > 0) {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) {
        this.screen = 'gameover';
        this.notify();
      }
    }

    // Visual-only easing (also runs on menus so nothing pops).
    if (!this.paused) {
      const target = this.phase === 'solid' ? 1 : 0;
      this.blend += (target - this.blend) * damp(14, dt);
      this.phasePulse = Math.max(0, this.phasePulse - dt * 2.2);
      this.shake *= Math.exp(-dt * 9);
      if (this.shake < 0.05) this.shake = 0;
      this.flash = Math.max(0, this.flash - dt * 1.6);

      if (this.alive) {
        const targetX = laneX(this.lane, this.width);
        const laneW = this.width / LANE_COUNT || 1;
        this.displayX += (targetX - this.displayX) * damp(20, dt);
        const lean = Math.max(-1, Math.min(1, ((targetX - this.displayX) / laneW) * 2.2));
        this.tilt += (lean - this.tilt) * damp(16, dt);
      }
    }

    if (running) this.notify();
    this.render(ts * 0.001, this.paused ? 0 : dt, running);
    this.raf = requestAnimationFrame(this.loop);
  };

  // ---- Rendering ----

  private render(t: number, dt: number, running: boolean) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const dpr = this.dpr;

    // Background / motion trail, un-shaken.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = running ? RACER_COLORS.trail : RACER_COLORS.bg;
    ctx.fillRect(0, 0, w, h);

    const sx = this.shake ? (Math.random() - 0.5) * this.shake * 2 : 0;
    const sy = this.shake ? (Math.random() - 0.5) * this.shake * 2 : 0;
    ctx.setTransform(dpr, 0, 0, dpr, sx * dpr, sy * dpr);

    this.drawStreaks(dt, running);
    this.drawLanes(t);

    if (this.screen === 'game' || this.screen === 'gameover') {
      this.drawOrbs(t);
      this.drawPickups(t);
      this.drawObstacles();
      if (this.alive) this.drawPlayer(t);
    }

    this.particles = stepParticles(ctx, this.particles, dt);
    this.drawPopups(dt);

    if (this.flash > 0) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = `rgba(${SOLID_RGB},${this.flash})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  private drawStreaks(dt: number, running: boolean) {
    const ctx = this.ctx;
    const v = running ? this.speed * this.timeScale : 70;
    ctx.save();
    ctx.lineWidth = 1;
    for (const s of this.streaks) {
      s.y += (v * dt * (0.6 + s.len * 6)) / (this.height || 1);
      if (s.y - s.len > 1) {
        s.y = -0.02;
        s.x = Math.random();
      }
      ctx.strokeStyle = `rgba(${SOLID_RGB},${s.a})`;
      ctx.beginPath();
      ctx.moveTo(s.x * this.width, s.y * this.height);
      ctx.lineTo(s.x * this.width, (s.y - s.len * (running ? 1 + v / 500 : 0.6)) * this.height);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawLanes(t: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = RACER_COLORS.laneLine;
    ctx.lineWidth = 1;
    ctx.setLineDash([10, 14]);
    const flow = this.screen === 'game' ? this.speed * this.timeScale : 70;
    ctx.lineDashOffset = -t * flow * 0.18;
    for (let i = 1; i < LANE_COUNT; i++) {
      const x = Math.round((this.width / LANE_COUNT) * i) + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawObstacles() {
    const ctx = this.ctx;
    for (const o of this.obstacles) {
      const x = laneX(o.lane, this.width);
      ctx.save();
      ctx.globalAlpha = o.passed ? 0.4 : 1;
      ctx.beginPath();
      ctx.arc(x, o.y, OBSTACLE_HALF + 10, 0, Math.PI * 2);
      ctx.fillStyle = RACER_COLORS.obstacleGlow;
      ctx.fill();

      ctx.translate(x, o.y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = RACER_COLORS.obstacle;
      ctx.fillRect(-OBSTACLE_HALF, -OBSTACLE_HALF, OBSTACLE_HALF * 2, OBSTACLE_HALF * 2);
      ctx.restore();
    }
  }

  private drawOrbs(t: number) {
    const ctx = this.ctx;
    const a = 0.3 + 0.7 * this.blend; // ghosted while you can't collect
    for (const orb of this.orbs) {
      const home = laneX(orb.lane, this.width);
      const ease = orb.pull * orb.pull * (3 - 2 * orb.pull);
      const x = home + (this.displayX - home) * ease;
      const bob = 1 + Math.sin(t * 5 + orb.id) * 0.08;

      ctx.save();
      ctx.globalAlpha = 0.4 * a;
      ctx.beginPath();
      ctx.arc(x, orb.y, (ORB_RADIUS + 6) * bob, 0, Math.PI * 2);
      ctx.strokeStyle = RACER_COLORS.orb;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.arc(x, orb.y, ORB_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = RACER_COLORS.orbCore;
      ctx.fill();
      ctx.restore();
    }
  }

  private drawPickups(t: number) {
    const ctx = this.ctx;
    const a = 0.3 + 0.7 * this.blend;
    for (const p of this.pickups) {
      const x = laneX(p.lane, this.width);
      const r = PICKUP_RADIUS;
      ctx.save();
      ctx.translate(x, p.y);
      ctx.globalAlpha = p.taken ? 0.25 : a;

      // Rotating dashed halo marks it as something special.
      ctx.save();
      ctx.rotate(t * 1.2);
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = RACER_COLORS.orbCore;
      ctx.globalAlpha *= 0.7;
      ctx.beginPath();
      ctx.arc(0, 0, r + 9 + Math.sin(t * 4) * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#131313';
      ctx.strokeStyle = RACER_COLORS.orbCore;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      this.drawPowerGlyph(p.kind, r * 0.55);
      ctx.restore();
    }
  }

  /** Tiny line icons so each power-up reads at a glance without color. */
  private drawPowerGlyph(kind: PowerKind, s: number) {
    const ctx = this.ctx;
    ctx.strokeStyle = RACER_COLORS.orbCore;
    ctx.fillStyle = RACER_COLORS.orbCore;
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    if (kind === 'shield') {
      ctx.moveTo(0, -s);
      ctx.lineTo(s * 0.95, -s * 0.55);
      ctx.lineTo(s * 0.8, s * 0.35);
      ctx.lineTo(0, s);
      ctx.lineTo(-s * 0.8, s * 0.35);
      ctx.lineTo(-s * 0.95, -s * 0.55);
      ctx.closePath();
      ctx.stroke();
    } else if (kind === 'magnet') {
      ctx.arc(0, -s * 0.1, s * 0.8, Math.PI, 0);
      ctx.moveTo(-s * 0.8, -s * 0.1);
      ctx.lineTo(-s * 0.8, s * 0.8);
      ctx.moveTo(s * 0.8, -s * 0.1);
      ctx.lineTo(s * 0.8, s * 0.8);
      ctx.stroke();
    } else if (kind === 'slow') {
      ctx.arc(0, 0, s, 0, Math.PI * 2);
      ctx.moveTo(0, -s * 0.6);
      ctx.lineTo(0, 0);
      ctx.lineTo(s * 0.5, s * 0.3);
      ctx.stroke();
    } else {
      ctx.font = `italic 700 ${Math.round(s * 1.7)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('×2', 0, 1);
    }
  }

  private drawPlayer(t: number) {
    const ctx = this.ctx;
    const y = this.height * PLAYER_Y_RATIO;
    const b = this.blend;
    const warn = this.getLive().phaseWarning;
    const blink = this.invuln > 0 && Math.floor(t * 18) % 2 === 0;

    ctx.save();
    ctx.translate(this.displayX, y);

    // Phase-change shockwave
    if (this.phasePulse > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, PLAYER_RADIUS + 12 + (1 - this.phasePulse) * 46, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${SOLID_RGB},${this.phasePulse * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Magnet field
    if (this.timers.magnet > 0) {
      ctx.save();
      ctx.setLineDash([2, 6]);
      ctx.lineDashOffset = -t * 20;
      ctx.beginPath();
      ctx.arc(0, 0, PLAYER_RADIUS + 26 + Math.sin(t * 6) * 3, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${SOLID_RGB},0.35)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    // Outer ring: solid line when solid, dashed when spectral, flickers before a flip.
    const ringFlicker = warn ? 0.55 + 0.45 * Math.sin(t * 40) : 1;
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, PLAYER_RADIUS + 12, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${SOLID_RGB},${(0.22 + 0.4 * b) * ringFlicker})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash(b > 0.5 ? [] : [3, 5]);
    ctx.stroke();
    ctx.restore();

    // Shield
    if (this.shield) {
      ctx.save();
      ctx.rotate(t * 1.5);
      ctx.beginPath();
      ctx.arc(0, 0, PLAYER_RADIUS + 19, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${SOLID_RGB},0.06)`;
      ctx.fill();
      ctx.setLineDash([22, 8]);
      ctx.strokeStyle = `rgba(${SOLID_RGB},0.85)`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // Body: leans into the turn and stretches slightly.
    ctx.rotate(this.tilt * 0.28);
    const stretch = 1 + Math.min(1, Math.abs(this.tilt)) * 0.12;
    ctx.scale(1 / Math.sqrt(stretch), stretch);
    ctx.beginPath();
    ctx.arc(0, 0, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${SOLID_RGB},${(0.32 + 0.68 * b) * (blink ? 0.35 : 1)})`;
    ctx.fill();
    ctx.restore();
  }

  private drawPopups(dt: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = 'italic 600 13px -apple-system, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    this.popups = this.popups.filter((p) => {
      p.life -= dt * 1.3;
      if (p.life <= 0) return false;
      p.y -= 38 * dt;
      ctx.globalAlpha = Math.min(1, p.life * 1.6);
      ctx.fillStyle = RACER_COLORS.playerSolid;
      ctx.fillText(p.text.toUpperCase(), p.x, p.y);
      return true;
    });
    ctx.restore();
  }
}
