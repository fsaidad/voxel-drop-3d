import { PIECE_COLORS, PIECES } from './pieces';
import {
  BOARD_SIZE,
  type ActivePiece,
  type Axis,
  type GameMode,
  type GameFeedback,
  type GameSnapshot,
  type PieceKind,
  type RenderCell,
  type Vec3i,
} from './types';

const KICKS: readonly Vec3i[] = [
  { x: 0, y: 0, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: -1, y: 0, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 0, z: -1 },
  { x: 0, y: 1, z: 0 },
];

class SeededRandom {
  constructor(private state: number) {}
  next(): number {
    this.state |= 0;
    this.state = (this.state + 0x6d2b79f5) | 0;
    let value = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }
}

class PieceQueue {
  private readonly items: PieceKind[] = [];
  constructor(private readonly random: SeededRandom) {
    this.fill();
  }
  take(): PieceKind {
    if (this.items.length < 7) this.fill();
    return this.items.shift() as PieceKind;
  }
  peek(count: number): readonly PieceKind[] {
    while (this.items.length < count) this.fill();
    return this.items.slice(0, count);
  }
  private fill(): void {
    const bag: PieceKind[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    for (let i = bag.length - 1; i > 0; i -= 1) {
      const j = Math.floor(this.random.next() * (i + 1));
      [bag[i], bag[j]] = [bag[j] as PieceKind, bag[i] as PieceKind];
    }
    this.items.push(...bag);
  }
}

export class GameEngine {
  private readonly board = new Uint8Array(BOARD_SIZE ** 3);
  private readonly queue: PieceQueue;
  private active: ActivePiece | null = null;
  private status: GameSnapshot['status'] = 'ready';
  private score = 0;
  private layers = 0;
  private pieces = 0;
  private feedback: GameFeedback | null = null;
  private feedbackId = 0;
  private tickCount = 0;

  constructor(
    seed: number,
    private readonly mode: GameMode = 'focus',
    initialBoard?: Uint8Array,
  ) {
    if (initialBoard) {
      if (initialBoard.length !== this.board.length)
        throw new RangeError(`Board must contain ${this.board.length} cells`);
      if (initialBoard.some((cell) => cell > 7))
        throw new RangeError('Board cells must use colors from 0 to 7');
      this.board.set(initialBoard);
    }
    this.queue = new PieceQueue(new SeededRandom(seed));
    this.spawn();
  }

  start(): void {
    if (this.status === 'ready') this.status = 'running';
  }

  move(dx: number, dz: number): boolean {
    if (this.status !== 'running' || !this.active) return false;
    const candidate = {
      ...this.active,
      origin: {
        x: this.active.origin.x + dx,
        y: this.active.origin.y,
        z: this.active.origin.z + dz,
      },
    };
    if (!this.canPlace(candidate)) return false;
    this.active = candidate;
    return true;
  }

  rotate(axis: Axis, direction: 1 | -1): boolean {
    if (this.status !== 'running' || !this.active) return false;
    const rotated = this.active.cells.map((cell) =>
      rotateCell(cell, axis, direction),
    );
    for (const kick of KICKS) {
      const candidate: ActivePiece = {
        ...this.active,
        cells: rotated,
        origin: {
          x: this.active.origin.x + kick.x,
          y: this.active.origin.y + kick.y,
          z: this.active.origin.z + kick.z,
        },
      };
      if (this.canPlace(candidate)) {
        this.active = candidate;
        return true;
      }
    }
    return false;
  }

  hardDrop(): boolean {
    if (this.status !== 'running' || !this.active) return false;
    const distance = this.dropDistance();
    this.active = {
      ...this.active,
      origin: { ...this.active.origin, y: this.active.origin.y - distance },
    };
    this.lock(distance * 2);
    return true;
  }

  softDrop(): boolean {
    if (this.status !== 'running' || !this.active) return false;
    const candidate = {
      ...this.active,
      origin: { ...this.active.origin, y: this.active.origin.y - 1 },
    };
    if (this.canPlace(candidate)) {
      this.active = candidate;
      this.score += 1;
    } else {
      this.lock();
    }
    return true;
  }

  step(): boolean {
    if (this.status !== 'running' || !this.active) return false;
    this.tickCount += 1;
    const gravityEvery =
      this.mode === 'focus'
        ? Math.max(6, 18 - (this.level - 1))
        : Math.max(3, 12 - (this.level - 1));
    if (this.tickCount % gravityEvery !== 0) return false;
    const candidate = {
      ...this.active,
      origin: { ...this.active.origin, y: this.active.origin.y - 1 },
    };
    if (this.canPlace(candidate)) this.active = candidate;
    else this.lock();
    return true;
  }

  togglePause(): void {
    if (this.status !== 'running' && this.status !== 'paused') return;
    this.status = this.status === 'paused' ? 'running' : 'paused';
  }

  pause(): void {
    if (this.status === 'running') this.status = 'paused';
  }

  snapshot(): GameSnapshot {
    const active = this.active
      ? this.worldCells(this.active).map((cell) => ({
          ...cell,
          color: this.active?.color ?? 1,
        }))
      : [];
    const ghost =
      this.active && this.mode === 'focus'
        ? this.worldCells({
            ...this.active,
            origin: {
              ...this.active.origin,
              y: this.active.origin.y - this.dropDistance(),
            },
          }).map((cell) => ({ ...cell, color: this.active?.color ?? 1 }))
        : [];
    return {
      board: this.board.slice(),
      active,
      ghost,
      next: this.queue.peek(this.mode === 'focus' ? 3 : 1),
      score: this.score,
      level: this.level,
      layers: this.layers,
      pieces: this.pieces,
      height: this.height,
      status: this.status,
      mode: this.mode,
      feedback: this.feedback,
      tick: this.tickCount,
    };
  }

  get level(): number {
    return 1 + Math.floor(this.layers / 10);
  }

  get height(): number {
    for (let y = BOARD_SIZE - 1; y >= 0; y -= 1)
      for (let z = 0; z < BOARD_SIZE; z += 1)
        for (let x = 0; x < BOARD_SIZE; x += 1)
          if (this.board[this.index({ x, y, z })] !== 0) return y + 1;
    return 0;
  }

  private spawn(): void {
    const kind = this.queue.take();
    const candidate: ActivePiece = {
      kind,
      cells: PIECES[kind].map((cell) => ({ ...cell })),
      color: PIECE_COLORS[kind],
      origin: {
        x: Math.floor(BOARD_SIZE / 2) - 1,
        y: BOARD_SIZE - 2,
        z: Math.floor(BOARD_SIZE / 2) - 1,
      },
    };
    if (!this.canPlace(candidate)) {
      this.active = null;
      this.status = 'game-over';
      return;
    }
    this.active = candidate;
  }

  private lock(dropPoints = 0): void {
    if (!this.active) return;
    const levelAtLock = this.level;
    for (const cell of this.worldCells(this.active))
      this.board[this.index(cell)] = this.active.color;
    this.pieces += 1;
    this.score += dropPoints;
    const cleared = this.clearLayers();
    let clearPoints = 0;
    if (cleared > 0) {
      this.layers += cleared;
      const table = [0, 100, 300, 500, 800];
      clearPoints =
        (table[Math.min(cleared, 4)] ?? 800 + (cleared - 4) * 400) *
        levelAtLock;
      this.score += clearPoints;
    }
    this.feedback = {
      id: (this.feedbackId += 1),
      kind: cleared > 0 ? 'clear' : 'lock',
      points: dropPoints + clearPoints,
      clearedLayers: cleared,
    };
    this.spawn();
  }

  private clearLayers(): number {
    const full: number[] = [];
    for (let y = 0; y < BOARD_SIZE; y += 1) {
      let occupied = 0;
      for (let z = 0; z < BOARD_SIZE; z += 1)
        for (let x = 0; x < BOARD_SIZE; x += 1)
          occupied += Number(this.board[this.index({ x, y, z })] !== 0);
      if (occupied === BOARD_SIZE * BOARD_SIZE) full.push(y);
    }
    if (full.length === 0) return 0;
    const compacted = new Uint8Array(this.board.length);
    let targetY = 0;
    for (let sourceY = 0; sourceY < BOARD_SIZE; sourceY += 1) {
      if (full.includes(sourceY)) continue;
      for (let z = 0; z < BOARD_SIZE; z += 1)
        for (let x = 0; x < BOARD_SIZE; x += 1)
          compacted[this.index({ x, y: targetY, z })] =
            this.board[this.index({ x, y: sourceY, z })] ?? 0;
      targetY += 1;
    }
    this.board.set(compacted);
    return full.length;
  }

  private dropDistance(): number {
    if (!this.active) return 0;
    let distance = 0;
    while (
      this.canPlace({
        ...this.active,
        origin: {
          ...this.active.origin,
          y: this.active.origin.y - distance - 1,
        },
      })
    )
      distance += 1;
    return distance;
  }

  private canPlace(piece: ActivePiece): boolean {
    return this.worldCells(piece).every(
      (cell) =>
        cell.x >= 0 &&
        cell.x < BOARD_SIZE &&
        cell.y >= 0 &&
        cell.y < BOARD_SIZE &&
        cell.z >= 0 &&
        cell.z < BOARD_SIZE &&
        this.board[this.index(cell)] === 0,
    );
  }

  private worldCells(piece: ActivePiece): RenderCell[] {
    return piece.cells.map((cell) => ({
      x: cell.x + piece.origin.x,
      y: cell.y + piece.origin.y,
      z: cell.z + piece.origin.z,
      color: piece.color,
    }));
  }

  private index(cell: Vec3i): number {
    return cell.x + BOARD_SIZE * (cell.z + BOARD_SIZE * cell.y);
  }
}

function rotateCell(cell: Vec3i, axis: Axis, direction: 1 | -1): Vec3i {
  if (axis === 'x')
    return { x: cell.x, y: -direction * cell.z, z: direction * cell.y };
  if (axis === 'y')
    return { x: direction * cell.z, y: cell.y, z: -direction * cell.x };
  return { x: -direction * cell.y, y: direction * cell.x, z: cell.z };
}
