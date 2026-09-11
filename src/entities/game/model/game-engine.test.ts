import { describe, expect, it } from 'vitest';
import { GameEngine } from './game-engine';

describe('GameEngine', () => {
  it('creates deterministic piece queues for the same seed', () => {
    expect(new GameEngine(42).snapshot().next).toEqual(
      new GameEngine(42).snapshot().next,
    );
  });

  it('keeps active cells inside the cubic board', () => {
    const game = new GameEngine(7);
    game.start();
    for (let index = 0; index < 20; index += 1) game.move(-1, 0);
    expect(
      game.snapshot().active.every((cell) => cell.x >= 0 && cell.x < 8),
    ).toBe(true);
  });

  it('hard drop locks exactly four voxels', () => {
    const game = new GameEngine(12);
    game.start();
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
    game.start();
    game.togglePause();
    const before = game.snapshot().tick;
    game.step();
    expect(game.snapshot().tick).toBe(before);
    game.togglePause();
    game.step();
    expect(game.snapshot().tick).toBe(before + 1);
  });

  it('waits for the player before starting gravity', () => {
    const game = new GameEngine(4);
    expect(game.snapshot().status).toBe('ready');
    for (let index = 0; index < 20; index += 1) game.step();
    expect(game.snapshot().tick).toBe(0);
    game.start();
    expect(game.snapshot().status).toBe('running');
  });

  it('soft drops one cell and awards one point', () => {
    const game = new GameEngine(5);
    const before = game.snapshot().active[0]?.y;
    game.start();
    expect(game.softDrop()).toBe(true);
    expect(game.snapshot().active[0]?.y).toBe((before ?? 0) - 1);
    expect(game.snapshot().score).toBe(1);
  });

  it('removes landing assistance in hardcore mode', () => {
    const focus = new GameEngine(6, 'focus').snapshot();
    const hardcore = new GameEngine(6, 'hardcore').snapshot();
    expect(focus.ghost).toHaveLength(4);
    expect(focus.next).toHaveLength(3);
    expect(hardcore.ghost).toHaveLength(0);
    expect(hardcore.next).toHaveLength(1);
  });
});
