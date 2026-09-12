import { describe, expect, it } from 'vitest';
import { BOARD_SIZE } from './types';
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
    const snapshot = game.snapshot();
    expect([...snapshot.board].filter(Boolean)).toHaveLength(4);
    expect(snapshot.pieces).toBe(1);
    expect(snapshot.height).toBeGreaterThan(0);
    expect(snapshot.feedback).toMatchObject({ id: 1, kind: 'lock' });
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

  it('clears a completed layer atomically and awards points', () => {
    const seed = 12;
    const landingCells = new GameEngine(seed).snapshot().ghost;
    const board = new Uint8Array(BOARD_SIZE ** 3);
    for (let z = 0; z < BOARD_SIZE; z += 1)
      for (let x = 0; x < BOARD_SIZE; x += 1) board[x + BOARD_SIZE * z] = 1;
    for (const cell of landingCells) board[cell.x + BOARD_SIZE * cell.z] = 0;

    const game = new GameEngine(seed, 'focus', board);
    game.start();
    game.hardDrop();
    const snapshot = game.snapshot();
    expect(snapshot.layers).toBe(1);
    expect([...snapshot.board].filter(Boolean)).toHaveLength(0);
    expect(snapshot.feedback).toMatchObject({
      kind: 'clear',
      clearedLayers: 1,
    });
    expect(snapshot.score).toBeGreaterThanOrEqual(100);
  });

  it('enters game over when the spawn volume is occupied', () => {
    const seed = 22;
    const spawnCells = new GameEngine(seed).snapshot().active;
    const board = new Uint8Array(BOARD_SIZE ** 3);
    for (const cell of spawnCells)
      board[cell.x + BOARD_SIZE * (cell.z + BOARD_SIZE * cell.y)] = 1;
    expect(new GameEngine(seed, 'focus', board).snapshot().status).toBe(
      'game-over',
    );
  });

  it('keeps rotated pieces valid at every wall', () => {
    const game = new GameEngine(30);
    game.start();
    for (const [dx, dz] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ] as const) {
      for (let index = 0; index < BOARD_SIZE * 2; index += 1) game.move(dx, dz);
      for (const axis of ['x', 'y', 'z'] as const) game.rotate(axis, 1);
      const cells = game.snapshot().active;
      expect(cells).toHaveLength(4);
      expect(new Set(cells.map(({ x, y, z }) => `${x}:${y}:${z}`)).size).toBe(
        4,
      );
      expect(
        cells.every(
          ({ x, y, z }) =>
            x >= 0 &&
            x < BOARD_SIZE &&
            y >= 0 &&
            y < BOARD_SIZE &&
            z >= 0 &&
            z < BOARD_SIZE,
        ),
      ).toBe(true);
    }
  });

  it('rejects malformed restored boards', () => {
    expect(() => new GameEngine(1, 'focus', new Uint8Array(3))).toThrow(
      RangeError,
    );
    const invalid = new Uint8Array(BOARD_SIZE ** 3);
    invalid[0] = 8;
    expect(() => new GameEngine(1, 'focus', invalid)).toThrow(RangeError);
  });
});
