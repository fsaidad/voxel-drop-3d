export const BOARD_SIZE = 8;

export type Axis = 'x' | 'y' | 'z';
export type PieceKind = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
export type GameMode = 'focus' | 'hardcore';
export type GameStatus = 'ready' | 'running' | 'paused' | 'game-over';
export type GameFeedbackKind = 'lock' | 'clear';

export interface Vec3i {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface RenderCell extends Vec3i {
  readonly color: number;
}

export interface GameFeedback {
  readonly id: number;
  readonly kind: GameFeedbackKind;
  readonly points: number;
  readonly clearedLayers: number;
}

export interface LayerPressure {
  readonly layer: number;
  readonly filled: number;
  readonly capacity: number;
  readonly ratio: number;
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
  readonly pieces: number;
  readonly height: number;
  readonly grounded: boolean;
  readonly layerPressure: LayerPressure | null;
  readonly status: GameStatus;
  readonly mode: GameMode;
  readonly feedback: GameFeedback | null;
  readonly tick: number;
}
