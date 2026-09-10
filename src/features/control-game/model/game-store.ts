'use client';

import { create } from 'zustand';
import { GameEngine, type Axis, type GameSnapshot } from '@/src/entities/game';
import {
  directionForIntent,
  getSnappedMovementBasis,
  type MoveIntent,
  type MovementBasis,
} from './camera-relative-movement';

interface GameStore {
  readonly snapshot: GameSnapshot;
  readonly movementBasis: MovementBasis;
  readonly moveRelative: (intent: MoveIntent) => void;
  readonly setCameraOrientation: (cameraX: number, cameraZ: number) => void;
  readonly rotate: (axis: Axis, direction?: 1 | -1) => void;
  readonly drop: () => void;
  readonly tick: () => void;
  readonly togglePause: () => void;
  readonly pause: () => void;
  readonly restart: () => void;
}

let engine = new GameEngine(20260908);

export const useGameStore = create<GameStore>((set, get) => {
  const publish = () => set({ snapshot: engine.snapshot() });
  return {
    snapshot: engine.snapshot(),
    movementBasis: getSnappedMovementBasis(10.5, 12.5),
    moveRelative: (intent) => {
      const direction = directionForIntent(intent, get().movementBasis);
      if (engine.move(direction.dx, direction.dz)) publish();
    },
    setCameraOrientation: (cameraX, cameraZ) => {
      const next = getSnappedMovementBasis(cameraX, cameraZ);
      const current = get().movementBasis;
      if (
        next.forward.dx !== current.forward.dx ||
        next.forward.dz !== current.forward.dz
      )
        set({ movementBasis: next });
    },
    rotate: (axis, direction = 1) => {
      if (engine.rotate(axis, direction)) publish();
    },
    drop: () => {
      if (engine.hardDrop()) publish();
    },
    tick: () => {
      if (engine.step()) publish();
    },
    togglePause: () => {
      engine.togglePause();
      publish();
    },
    pause: () => {
      engine.pause();
      publish();
    },
    restart: () => {
      engine = new GameEngine((Date.now() ^ 0x9e3779b9) >>> 0);
      publish();
    },
  };
});
