# KIMIKO

Lay your phone flat. Place all ten fingers on the screen. The phone locks
each fingertip into its own zone — from that moment, lifting a finger is
the only gesture. No taps, no swipes: the interaction is withdrawal, not
approach.

Left hand comes in from the left, right hand from the right, leaving an
open gap in the middle where prompts, letters, and falling objects appear.
What a lift does depends on the active mode:

- **Type** — each finger maps to a home-row letter; lift the right one to
  spell out a word.
- **Dodge** — objects fall toward a specific finger; lift it in time to
  zap them.
- **Memory** — a Simon-says sequence of fingers lights up; replay it back.
- **Rhythm** — a beat highlights a finger on tempo; lift on the beat for
  PERFECT/GOOD timing.

KIMIKO is a PWA: it installs to the home screen, runs fullscreen, and
works offline via a service worker once loaded once.

## Project layout

```
src/
  app/                    Next.js App Router shell (layout, page, manifest, globals.css)
  components/
    game/                 Canvas, HUD, and other in-game UI pieces
    screens/              The four top-level screens (intro, place fingers, mode select, game)
    pwa/                  Service worker registration
  hooks/                  React bridges to the engine (useKimikoEngine, useOrientationWarning)
  lib/engine/
    KimikoEngine.ts        Framework-agnostic game engine: touch state, finger zones, render loop
    modes/                 One file per game mode (typing, dodge, memory, rhythm) behind a
                            shared GameModeController interface + a registry — add a new mode
                            by dropping in a file and registering it, nothing else changes
    renderer.ts, particles.ts, fingerZones.ts, constants.ts   Rendering and gameplay primitives
public/
  sw.js                   Service worker (network-first with offline fallback)
  icons/                  App icon
```

React only talks to the engine through `engine.subscribe(...)` (for UI state)
and a handful of action methods (`showPlace()`, `startMode(id)`, `exitGame()`,
...) — the canvas render loop and touch handling run independently of React's
render cycle.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On desktop, a single
mouse click simulates one finger (enough to click through the UI); the real
ten-finger flow needs a touchscreen.

> **Note:** `dev`/`build` are pinned to `--webpack` instead of Turbopack.
> In this environment (Next.js 16 inside a OneDrive-synced folder), the
> Turbopack native binary fails to load (`not a valid Win32 application`)
> and falls back to a broken WASM path. Webpack sidesteps it. If you move
> the project outside OneDrive and confirm Turbopack loads cleanly, you can
> drop `--webpack` from both scripts.

## What's still open

Per the original concept, this rebuild ports the four prototype modes and
the core "lift is the action" mechanic faithfully, but leaves deliberately
open:

- **Input depth** — lifts are still binary; slide-before-lift, pressure,
  and hover aren't mapped to anything yet.
- **The middle gap** — currently just holds text prompts; could become a
  cursor, canvas, or reactive face.
- **Sound** — no audio engine yet; rhythm mode in particular is built for one.
- **Multiplayer** — two hands, one phone, facing each other.
- **Accessibility** — the "rest all fingers, lift one" model may suit users
  who struggle with precise tapping; unexplored.
