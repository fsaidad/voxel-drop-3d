'use client';

import { create } from 'zustand';
import {
  GameEngine,
  type Axis,
  type GameMode,
  type GameSnapshot,
} from '@/src/entities/game';
import {
  directionForIntent,
  getSnappedMovementBasis,
  type MoveIntent,
  type MovementBasis,
} from './camera-relative-movement';
import { nextTutorialStep, type TutorialStep } from './tutorial';

interface GameStore {
  readonly snapshot: GameSnapshot;
  readonly movementBasis: MovementBasis;
  readonly resumeCountdown: number | null;
  readonly tutorialStep: TutorialStep | null;
  readonly moveRelative: (intent: MoveIntent) => void;
  readonly setCameraOrientation: (cameraX: number, cameraZ: number) => void;
  readonly registerCameraInteraction: () => void;
  readonly rotate: (axis: Axis, direction?: 1 | -1) => void;
  readonly drop: () => void;
  readonly softDrop: () => void;
  readonly tick: () => void;
  readonly togglePause: () => void;
  readonly advanceResumeCountdown: () => void;
  readonly pause: () => void;
  readonly start: (mode: GameMode) => void;
  readonly startTutorial: () => void;
  readonly finishTutorial: () => void;
  readonly restart: () => void;
}

let engine = new GameEngine(20260908);

export const useGameStore = create<GameStore>((set, get) => {
  const publish = () => set({ snapshot: engine.snapshot() });
  const advanceTutorial = (expected: TutorialStep) => {
    if (get().tutorialStep === expected)
      set({ tutorialStep: nextTutorialStep(expected) });
  };
  return {
    snapshot: engine.snapshot(),
    movementBasis: getSnappedMovementBasis(10.5, 12.5),
    resumeCountdown: null,
    tutorialStep: null,
    moveRelative: (intent) => {
      const direction = directionForIntent(intent, get().movementBasis);
      if (engine.move(direction.dx, direction.dz)) {
        publish();
        advanceTutorial('move');
      }
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
    registerCameraInteraction: () => advanceTutorial('camera'),
    rotate: (axis, direction = 1) => {
      if (engine.rotate(axis, direction)) {
        publish();
        advanceTutorial('rotate');
      }
    },
    drop: () => {
      if (engine.hardDrop()) {
        publish();
        advanceTutorial('drop');
      }
    },
    softDrop: () => {
      if (engine.softDrop()) publish();
    },
    tick: () => {
      if (get().tutorialStep !== null) return;
      if (engine.step()) publish();
    },
    togglePause: () => {
      const state = get();
      if (state.snapshot.status === 'running') {
        engine.pause();
        set({ snapshot: engine.snapshot(), resumeCountdown: null });
        return;
      }
      if (state.snapshot.status !== 'paused') return;
      set({ resumeCountdown: state.resumeCountdown === null ? 3 : null });
    },
    advanceResumeCountdown: () => {
      const countdown = get().resumeCountdown;
      if (countdown === null) return;
      if (countdown > 1) {
        set({ resumeCountdown: countdown - 1 });
        return;
      }
      engine.togglePause();
      set({ snapshot: engine.snapshot(), resumeCountdown: null });
    },
    pause: () => {
      engine.pause();
      set({ snapshot: engine.snapshot(), resumeCountdown: null });
    },
    start: (mode) => {
      engine = new GameEngine((Date.now() ^ 0x9e3779b9) >>> 0, mode);
      engine.start();
      set({
        snapshot: engine.snapshot(),
        resumeCountdown: null,
        tutorialStep: null,
      });
    },
    startTutorial: () => {
      engine = new GameEngine((Date.now() ^ 0x9e3779b9) >>> 0, 'focus');
      engine.start();
      set({
        snapshot: engine.snapshot(),
        resumeCountdown: null,
        tutorialStep: 'camera',
      });
    },
    finishTutorial: () => {
      engine = new GameEngine((Date.now() ^ 0x9e3779b9) >>> 0, 'focus');
      engine.start();
      set({
        snapshot: engine.snapshot(),
        resumeCountdown: null,
        tutorialStep: null,
      });
    },
    restart: () => {
      const tutorialStep = get().tutorialStep;
      const mode = engine.snapshot().mode;
      engine = new GameEngine((Date.now() ^ 0x9e3779b9) >>> 0, mode);
      engine.start();
      set({
        snapshot: engine.snapshot(),
        resumeCountdown: null,
        tutorialStep: tutorialStep === null ? null : 'camera',
      });
    },
  };
});
