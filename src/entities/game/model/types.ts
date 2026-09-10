export const BOARD_SIZE = 8;

export type Axis = 'x' | 'y' | 'z';
export type PieceKind = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
export type GameStatus = 'running' | 'paused' | 'game-over';

export interface Vec3i {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface RenderCell extends Vec3i {
  readonly color: number;
}

export interface ActivePiece {
  readonly kind: PieceKind;
  readonly origin: Vec3i;
  readonly cells: readonly Vec3i[];
  readonly color: number;
}

export interface GameSnapshot {
  readonly board: Uint8Array;
  readonly active: readonly RenderCell[];
  readonly ghost: readonly RenderCell[];
  readonly next: readonly PieceKind[];
  readonly score: number;
  readonly level: number;
  readonly layers: number;
  readonly status: GameStatus;
  readonly tick: number;
}
