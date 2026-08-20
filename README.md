# KIMIKO — Ghost Racer

A ghost drifts down three lanes on its own. Tap the left or right half of
the screen to switch lanes. Dodge what's solid, collect what isn't.

The twist: the ghost automatically alternates between two states on a
visible clock —

- **Solid** — obstacles hit you (game over), and orbs count when collected.
- **Spectral** — you pass through everything untouched, but orbs pass
  through you too, unscored.

Survival means reading the phase clock and your lane together, not just
reacting to what's coming. Best score is kept locally (`localStorage`).

KIMIKO is a PWA: it installs to the home screen, runs fullscreen, and
works offline via a service worker once loaded once.

## Project layout

```
src/
  app/                    Next.js App Router shell (layout, page, manifest, globals.css)
  components/
    game/                 Canvas, HUD, and root game wiring
    screens/              Intro and game-over overlays
    pwa/                  Service worker registration
  hooks/                  useRacerEngine — the React bridge to the engine
  lib/racer/
    RacerEngine.ts         Framework-agnostic engine: lanes, obstacles, orbs, phase clock, render loop
    particles.ts, constants.ts, types.ts
public/
  sw.js                   Service worker (network-first with offline fallback)
  icons/                  App icon
```

React only talks to the engine through `engine.subscribe(...)` (for UI state)
and a handful of action methods (`startGame()`, `moveLane(dir)`, `restart()`,
`showIntro()`) — the canvas render loop and input handling run independently
of React's render cycle.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On desktop, click the
left/right half of the window (or use arrow keys / A-D) to switch lanes.

> **Note:** `dev`/`build` are pinned to `--webpack` instead of Turbopack.
> In this environment (Next.js 16 inside a OneDrive-synced folder), the
> Turbopack native binary fails to load (`not a valid Win32 application`)
> and falls back to a broken WASM path. Webpack sidesteps it. If you move
> the project outside OneDrive and confirm Turbopack loads cleanly, you can
> drop `--webpack` from both scripts.

## History

This started as a multitouch "rest all ten fingers, lift one to act"
concept — that mechanic is gone. It turned out to be unreliable on real
hardware (most phones physically cap out around 5 simultaneous touch
points) and, even scaled down to 4 fingers, didn't play well. What's left
is the visual language that survived the pivot: the ash/grey/black
palette, the oblique chamfered-corner "menu" chrome, and the ghostly
pulse-and-blur idle state.

## What's still open

- **Sound** — no audio engine yet.
- **More phase behaviors** — a third state, phase-triggered lane hazards,
  a difficulty curve tied to phase timing instead of just speed.
- **Accessibility** — tap targets, colorblind-safe feedback (already
  brightness-based rather than hue-based, worth verifying).
