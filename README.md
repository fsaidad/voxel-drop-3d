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
- `Space`: hard drop
- `P` or `Esc`: pause
- mouse/touch drag: orbit camera
- wheel/pinch: zoom

Mobile controls are displayed automatically on narrow screens.

## Production baseline

The repository contains only application code, tests, documentation, and CI configuration. Local environments, build output, hosting metadata, and generated files are ignored. Dependencies are pinned and every push is checked with linting, type checking, tests, and a production build.
