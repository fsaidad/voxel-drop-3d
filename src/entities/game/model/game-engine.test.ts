import { describe, expect, it } from 'vitest';
import { GameEngine } from './game-engine';

describe('GameEngine', () => {
  it('creates deterministic piece queues for the same seed', () => {
    expect(new GameEngine(42).snapshot().next).toEqual(new GameEngine(42).snapshot().next);
  });

  it('keeps active cells inside the cubic board', () => {
    const game = new GameEngine(7);
    for (let index = 0; index < 20; index += 1) game.move(-1, 0);
    expect(game.snapshot().active.every((cell) => cell.x >= 0 && cell.x < 8)).toBe(true);
  });

  it('hard drop locks exactly four voxels', () => {
    const game = new GameEngine(12);
    game.hardDrop();
    expect([...game.snapshot().board].filter(Boolean)).toHaveLength(4);
  });

  it('does not mutate internal state through snapshots', () => {
    const game = new GameEngine(9);
    const snapshot = game.snapshot();
    snapshot.board[0] = 7;
    expect(game.snapshot().board[0]).toBe(0);
  });

  it('pauses and resumes without advancing the simulation', () => {
    const game = new GameEngine(3);
    game.togglePause();
    const before = game.snapshot().tick;
    game.step();
    expect(game.snapshot().tick).toBe(before);
    game.togglePause();
    game.step();
    expect(game.snapshot().tick).toBe(before + 1);
  });
});
