# Voxel Drop 3D

An interactive 3D browser game that demonstrates how a complex real-time interface can stay readable, responsive, and testable across desktop and mobile.

[Play the live demo](https://voxel-drop-3d.vercel.app/) · [View the source](https://github.com/fsaidad/voxel-drop-3d)

## Why this project matters

Voxel Drop is more than a visual experiment. It is a compact product case for the same engineering problems found in interactive product demos, 3D configurators, gamified onboarding, and data-rich dashboards:

- a deterministic domain model separated from the UI;
- a responsive WebGL scene with camera-relative controls;
- clear feedback for dense spatial state;
- desktop, keyboard, mouse, touch, and mobile interaction;
- persistent user progress without requiring an account;
- production checks for types, linting, tests, and builds.

## Product experience

The player places falling tetrominoes inside an 8×8×8 cube. The interface explains a three-dimensional board without covering the playfield:

- **Focus and Hardcore modes** for different levels of assistance;
- **English and Russian UI**, including tutorials, achievements and recovery messages; the language choice is saved separately from game progress;
- landing projection, next-piece preview, hold mechanic, lock delay, and layer guides;
- camera-relative movement with an on-stage compass;
- interactive tutorial without score or gravity pressure;
- keyboard, mouse, touch, and automatic mobile controls;
- light and dark themes that follow the device setting;
- local achievements, cosmetic voxel skins, and player statistics;
- synthesized audio cues with no downloaded audio assets.

## Engineering highlights

[Technical SEO case with reproducible before/after evidence](docs/SEO-CASE-EN.md) · [Русский разбор](docs/SEO-CASE-RU.md)

- **Deterministic game engine.** The domain accepts a seed and has no dependency on React, Three.js, Zustand, browser globals, or wall-clock time. This makes gameplay reproducible and unit-testable.
- **Performance-conscious 3D rendering.** Board voxels use instancing. The scene is loaded as a separate client chunk and renders on demand instead of consuming GPU resources continuously while idle.
- **Maintainable boundaries.** Feature-Sliced Design separates application composition, user actions, reusable widgets, and the framework-independent game domain.
- **Defensive local persistence.** Progress is stored in a versioned and validated browser profile that can later be synchronized with an account backend.
- **Production baseline.** Every push is checked with linting, type checking, tests, and a production build.

## Stack

- Next.js 16 and React 19
- TypeScript
- Three.js with React Three Fiber and Drei
- Zustand
- Tailwind CSS
- Vitest
- Oxlint and Oxfmt

## Architecture

```text
app/                 Next.js routing and application entry points
src/widgets/         reusable product-level compositions
src/features/        player actions and interaction flows
src/entities/game/   deterministic game rules and state transitions
```

Rendering consumes immutable game snapshots. The engine can therefore evolve independently from the WebGL scene, and the same state could be rendered by another client or synchronized through a backend.

## Run locally

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Node.js 22.13 or newer is required.

## Controls

- `W A S D` — move across the X/Z plane
- `Q E` — rotate around Y
- arrow keys — rotate around X/Z
- `C` — hold or swap the active piece once per placement
- `Shift` — soft drop by one voxel
- `Space` — hard drop
- `P` or `Esc` — pause
- mouse or touch drag — orbit the camera
- wheel or pinch — zoom

## Commercial relevance

This project is evidence of practical work with React, Next.js, TypeScript, WebGL, complex state, responsive interaction, and performance-sensitive UI. The same approach is suitable for interactive landing pages, product visualizations, browser games, configurators, and gamified iGaming interfaces.

For collaboration, contact me through my [GitHub profile](https://github.com/fsaidad).
