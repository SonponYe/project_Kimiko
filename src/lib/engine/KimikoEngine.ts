import { lockFingerZones } from './fingerZones';
import { createModeController } from './modes/registry';
import type { GameModeController } from './modes/types';
import { createParticles, createRing, stepParticles, stepRings } from './particles';
import { clearFrame, drawActiveTouches, drawFingerZones, drawGrid, drawIdleBackground } from './renderer';
import type { EngineSnapshot, FingerZone, FlashEvent, GameModeId, Particle, Ring, ScreenId, TouchPoint, TypedDisplayState } from './types';

type Listener = (snapshot: EngineSnapshot) => void;

const PLACE_LOCK_DELAY_MS = 600;
const FLASH_DURATION_MS = 400;
const LIFT_HIT_RADIUS = 120;

/**
 * Framework-agnostic game engine: owns touch state, finger zones, the canvas
 * render loop, and the currently active game mode. React only talks to it
 * through `subscribe` (for UI-relevant state) and its public action methods.
 */
export class KimikoEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;

  private screen: ScreenId = 'intro';
  private activeTouches = new Map<number, TouchPoint>();
  fingerZones: FingerZone[] = [];

  private mode: GameModeId | null = null;
  private activeController: GameModeController | null = null;
  private gameActive = false;

  score = 0;
  combo = 1;

  private particles: Particle[] = [];
  private rings: Ring[] = [];
  private promptLetter = '';
  private typedDisplay: TypedDisplayState | null = null;
  private flashState: FlashEvent | null = null;
  private flashSeq = 0;
  private flashTimer: number | null = null;

  private placeLockTimer: number | null = null;
  private pendingTimers = new Set<number>();

  private raf: number | null = null;
  private listeners = new Set<Listener>();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('KimikoEngine: 2D canvas context is unavailable');
    this.ctx = ctx;
  }

  // ---- Lifecycle ----

  start() {
    clearFrame(this.ctx, this.width, this.height, false);
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy() {
    if (this.raf !== null) cancelAnimationFrame(this.raf);
    this.clearScheduled();
    if (this.flashTimer !== null) clearTimeout(this.flashTimer);
    if (this.placeLockTimer !== null) clearTimeout(this.placeLockTimer);
    this.listeners.clear();
  }

  resize(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;
  }

  canvasSize() {
    return { w: this.width, h: this.height };
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

  private getSnapshot(): EngineSnapshot {
    return {
      screen: this.screen,
      fingerCount: this.activeTouches.size,
      fingerZonesLocked: this.fingerZones.length === 10,
      mode: this.mode,
      score: this.score,
      combo: this.combo,
      typedDisplay: this.typedDisplay,
      promptLetter: this.promptLetter,
      flash: this.flashState,
    };
  }

  // ---- Screen navigation ----

  showIntro() {
    this.teardownMode();
    this.screen = 'intro';
    this.fingerZones = [];
    this.activeTouches.clear();
    clearFrame(this.ctx, this.width, this.height, false);
    this.notify();
  }

  showPlace() {
    this.screen = 'place';
    this.notify();
  }

  exitGame() {
    this.showIntro();
  }

  // ---- Touch handling ----

  handleTouchStart(id: number, x: number, y: number) {
    this.activeTouches.set(id, { x, y });
    this.afterTouchCountChange();
  }

  handleTouchMove(id: number, x: number, y: number) {
    const point = this.activeTouches.get(id);
    if (point) {
      point.x = x;
      point.y = y;
    }
  }

  handleTouchEnd(id: number, x: number, y: number) {
    if (this.screen === 'game' && this.gameActive && this.fingerZones.length === 10) {
      this.dispatchLift(x, y);
    }
    this.activeTouches.delete(id);
    this.afterTouchCountChange();
  }

  private afterTouchCountChange() {
    if (this.screen === 'place') {
      const count = this.activeTouches.size;
      if (count >= 10) {
        if (this.placeLockTimer === null) {
          this.placeLockTimer = window.setTimeout(() => {
            this.placeLockTimer = null;
            if (this.activeTouches.size >= 10) this.lockZones();
          }, PLACE_LOCK_DELAY_MS);
        }
      } else if (this.placeLockTimer !== null) {
        clearTimeout(this.placeLockTimer);
        this.placeLockTimer = null;
      }
    }
    this.notify();
  }

  private lockZones() {
    const points = Array.from(this.activeTouches.values());
    this.fingerZones = lockFingerZones(points, this.width, this.height);
    this.screen = 'mode-select';
    this.notify();
  }

  private dispatchLift(x: number, y: number) {
    let closest = -1;
    let bestDist = Infinity;
    this.fingerZones.forEach((z, i) => {
      const d = Math.hypot(z.x - x, z.y - y);
      if (d < bestDist) {
        bestDist = d;
        closest = i;
      }
    });
    if (closest === -1 || bestDist > LIFT_HIT_RADIUS) return;

    const zone = this.fingerZones[closest];
    this.spawnParticles(zone.x, zone.y, zone.color, 6);
    this.activeController?.onLift(this, closest);
  }

  // ---- Mode lifecycle ----

  startMode(id: GameModeId) {
    this.teardownMode();
    this.mode = id;
    this.gameActive = true;
    this.score = 0;
    this.combo = 1;
    this.typedDisplay = null;
    this.promptLetter = '';
    this.particles = [];
    this.rings = [];
    this.screen = 'game';
    this.activeController = createModeController(id);
    this.activeController.start(this);
    this.notify();
  }

  private teardownMode() {
    this.activeController?.stop?.(this);
    this.activeController = null;
    this.gameActive = false;
    this.mode = null;
    this.clearScheduled();
  }

  // ---- Timers (auto-cleaned on mode teardown) ----

  schedule(fn: () => void, ms: number): number {
    const id = window.setTimeout(() => {
      this.pendingTimers.delete(id);
      fn();
    }, ms);
    this.pendingTimers.add(id);
    return id;
  }

  private clearScheduled() {
    this.pendingTimers.forEach((id) => clearTimeout(id));
    this.pendingTimers.clear();
  }

  // ---- Mode-facing API ----

  addScore(n: number) {
    this.score += n;
    this.notify();
  }

  subtractScore(n: number) {
    this.score = Math.max(0, this.score - n);
    this.notify();
  }

  bumpCombo(max: number) {
    this.combo = Math.min(this.combo + 1, max);
    this.notify();
  }

  incrementCombo() {
    this.combo += 1;
    this.notify();
  }

  resetCombo() {
    this.combo = 1;
    this.notify();
  }

  setPrompt(text: string) {
    this.promptLetter = text;
    this.notify();
  }

  setTypedDisplay(display: TypedDisplayState | null) {
    this.typedDisplay = display;
    this.notify();
  }

  flash(text: string, color: string) {
    this.flashState = { text, color, id: ++this.flashSeq };
    this.notify();
    if (this.flashTimer !== null) clearTimeout(this.flashTimer);
    this.flashTimer = window.setTimeout(() => {
      this.flashState = null;
      this.notify();
    }, FLASH_DURATION_MS);
  }

  spawnParticles(x: number, y: number, color: string, n: number) {
    this.particles.push(...createParticles(x, y, color, n));
  }

  highlightZone(idx: number) {
    const zone = this.fingerZones[idx];
    if (!zone) return;
    this.spawnParticles(zone.x, zone.y, zone.color, 8);
    this.rings.push(createRing(zone.x, zone.y, zone.color));
  }

  // ---- Render loop ----

  private loop = (ts: number) => {
    this.render(ts);
    this.raf = requestAnimationFrame(this.loop);
  };

  private render(ts: number) {
    const ctx = this.ctx;

    if (this.gameActive) {
      clearFrame(ctx, this.width, this.height, true);
      drawGrid(ctx, this.width, this.height);
      drawFingerZones(ctx, this.fingerZones, this.activeTouches, ts * 0.001);
      drawActiveTouches(ctx, this.activeTouches);
      this.activeController?.update?.(this, ctx);
      this.rings = stepRings(ctx, this.rings);
      this.particles = stepParticles(ctx, this.particles);
    } else {
      drawIdleBackground(ctx, this.width, this.height, ts * 0.001);
    }
  }
}
