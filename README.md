# Voxel Drop 3D

Production-oriented browser game about placing falling tetrominoes inside an 8×8×8 cube.

## Commands

```bash
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

## Architecture

The project follows Feature-Sliced Design. The App Router files form the `app/pages` integration layer; reusable composition lives in `widgets`, user actions in `features`, and the framework-independent game domain in `entities/game`.

The game engine is deterministic for a supplied seed and has no dependency on React, Three.js, Zustand, browser globals, or wall-clock time. Rendering consumes immutable snapshots and uses instancing for the board voxels.

## Controls

- `W A S D`: move across the X/Z plane
- `Q E`: rotate around Y
- arrow keys: rotate around X/Z
- `Shift`: soft drop by one voxel
- `Space`: hard drop
- `P` or `Esc`: pause
- mouse/touch drag: orbit camera
- wheel/pinch: zoom

Mobile controls are displayed automatically on narrow screens.

## Game modes

- **Focus**: slower gravity, three-piece preview, and a landing projection.
- **Hardcore**: faster gravity, one-piece preview, and no landing assistance.

The simulation waits on the start screen, so the player can choose a camera angle and mode before gravity begins.
Placement feedback, earned-point callouts, piece count, and stack height keep the state of the 3D board readable without covering the playfield.

## Production baseline

The repository contains only application code, tests, documentation, and CI configuration. Local environments, build output, hosting metadata, and generated files are ignored. Dependencies are pinned and every push is checked with linting, type checking, tests, and a production build.

The 3D scene is loaded as a separate client chunk and renders on demand, keeping the initial shell responsive and avoiding continuous GPU work while the board is idle.
