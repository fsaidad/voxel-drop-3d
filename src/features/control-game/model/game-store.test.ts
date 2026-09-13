import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from './game-store';

describe('game session controls', () => {
  beforeEach(() => useGameStore.getState().start('focus'));

  it('keeps the engine paused until the resume countdown completes', () => {
    useGameStore.getState().togglePause();
    expect(useGameStore.getState().snapshot.status).toBe('paused');

    useGameStore.getState().togglePause();
    expect(useGameStore.getState().resumeCountdown).toBe(3);
    expect(useGameStore.getState().snapshot.status).toBe('paused');

    useGameStore.getState().advanceResumeCountdown();
    useGameStore.getState().advanceResumeCountdown();
    expect(useGameStore.getState().snapshot.status).toBe('paused');
    useGameStore.getState().advanceResumeCountdown();

    expect(useGameStore.getState().resumeCountdown).toBeNull();
    expect(useGameStore.getState().snapshot.status).toBe('running');
  });

  it('cancels a pending resume when pause is requested again', () => {
    useGameStore.getState().togglePause();
    useGameStore.getState().togglePause();
    useGameStore.getState().togglePause();

    expect(useGameStore.getState().resumeCountdown).toBeNull();
    expect(useGameStore.getState().snapshot.status).toBe('paused');
  });

  it('starts tutorial without gravity and advances on real actions', () => {
    useGameStore.getState().startTutorial();
    const initialTick = useGameStore.getState().snapshot.tick;
    useGameStore.getState().tick();
    expect(useGameStore.getState().snapshot.tick).toBe(initialTick);

    useGameStore.getState().registerCameraInteraction();
    expect(useGameStore.getState().tutorialStep).toBe('move');
    useGameStore.getState().moveRelative('left');
    expect(useGameStore.getState().tutorialStep).toBe('hold');
    useGameStore.getState().hold();
    expect(useGameStore.getState().tutorialStep).toBe('yaw');
    useGameStore.getState().rotate('x');
    expect(useGameStore.getState().tutorialStep).toBe('yaw');
    useGameStore.getState().rotate('y');
    expect(useGameStore.getState().tutorialStep).toBe('tilt');
    useGameStore.getState().rotate('y');
    expect(useGameStore.getState().tutorialStep).toBe('tilt');
    useGameStore.getState().rotate('x');
    expect(useGameStore.getState().tutorialStep).toBe('drop');
    useGameStore.getState().drop();
    expect(useGameStore.getState().tutorialStep).toBe('complete');
  });

  it('returns to a waiting menu without starting another session', () => {
    const sessionId = useGameStore.getState().sessionId;
    useGameStore.getState().returnToMenu();

    expect(useGameStore.getState().snapshot.status).toBe('ready');
    expect(useGameStore.getState().sessionId).toBe(sessionId);
  });
});
