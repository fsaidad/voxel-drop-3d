import type { PieceKind, Vec3i } from './types';

export const PIECES: Readonly<Record<PieceKind, readonly Vec3i[]>> = {
  I: [{ x: -1, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }],
  O: [{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 }],
  T: [{ x: -1, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }],
  S: [{ x: -1, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 }],
  Z: [{ x: -1, y: 0, z: 1 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }],
  J: [{ x: -1, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 1, y: 0, z: 1 }],
  L: [{ x: -1, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: -1, y: 0, z: 1 }],
};

export const PIECE_COLORS: Readonly<Record<PieceKind, number>> = {
  I: 1, O: 2, T: 3, S: 4, Z: 5, J: 6, L: 7,
};
