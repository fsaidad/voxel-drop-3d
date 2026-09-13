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
Movement and soft drop use a consistent delayed auto-repeat, so held controls
feel the same across operating systems. The on-stage compass shows how WASD map
to the world axes after every camera turn.

Pause freezes the simulation but keeps orbit and zoom available for inspecting
the board. Resuming uses a short countdown. A separate interactive tutorial
teaches camera-relative movement, all three rotation axes, and placement without
gravity or score pressure.

## Game modes

- **Focus**: slower gravity, three-piece preview, and a landing projection.
- **Hardcore**: faster gravity, one-piece preview, and no landing assistance.

Both modes keep a stable pace throughout the session; there is no level system.

The simulation waits on the start screen, so the player can choose a camera angle and mode before gravity begins.
Placement feedback, earned-point callouts, piece count, and stack height keep the state of the 3D board readable without covering the playfield.
Grounded pieces remain movable for a short lock delay; a warm edge indicates
the landing state. Dense layers receive a completion guide; a high stack marks
the critical zone in both the WebGL volume and the HUD.

Short synthesized cues distinguish the start, placement, layer clear, and game
over states. They use the Web Audio API, require no downloaded audio assets, and
can be disabled from the header; the preference is stored locally.

## Appearance

The interface and the WebGL scene automatically follow the device light or dark color scheme. Theme changes are applied live through `prefers-color-scheme`; no theme preference or analytics data is stored.

## Progression

Achievements are evaluated outside the game engine and unlock cosmetic voxel
skins without affecting gameplay. Progress, unlocked rewards, and the selected
skin are stored locally in a versioned, validated browser profile that can later
be synchronized with an account backend.

The profile presents the best score, played sessions, placed pieces, cleared
layers, achievements, and the cosmetic collection. Opening it during a session
pauses the simulation. The game-over summary highlights a new record and rewards
earned during that run.

## Production baseline

The repository contains only application code, tests, documentation, and CI configuration. Local environments, build output, hosting metadata, and generated files are ignored. Dependencies are pinned and every push is checked with linting, type checking, tests, and a production build.

The 3D scene is loaded as a separate client chunk and renders on demand, keeping the initial shell responsive and avoiding continuous GPU work while the board is idle. Board voxels remain instanced, while feedback animation runs in the lightweight interface layer.
