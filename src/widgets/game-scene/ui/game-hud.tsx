'use client';

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronsDown,
  Pause,
  Play,
  Rotate3D,
  RotateCcw,
} from 'lucide-react';
import {
  BOARD_SIZE,
  type GameStatus,
  type GameSnapshot,
  type LayerPressure,
} from '@/src/entities/game';
import { useGameStore } from '@/src/features/control-game';
import { Button } from '@/src/shared/ui';

export function GameHeader({ snapshot }: { readonly snapshot: GameSnapshot }) {
  const togglePause = useGameStore((state) => state.togglePause);
  const restart = useGameStore((state) => state.restart);
  const canPause =
    snapshot.status === 'running' || snapshot.status === 'paused';
  return (
    <header className="game-header relative z-30 flex items-center justify-between border-b px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <span className="theme-cyan grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/30 bg-gradient-to-br from-cyan-300/20 to-violet-400/10 font-mono text-sm font-bold shadow-[0_0_28px_rgba(57,221,255,.12)]">
          VD
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold tracking-tight">Voxel Drop</h1>
            <span
              className={`hidden rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[.16em] sm:inline ${snapshot.mode === 'hardcore' ? 'theme-rose border-rose-300/20 bg-rose-300/8' : 'theme-cyan border-cyan-300/20 bg-cyan-300/8'}`}
            >
              {snapshot.status === 'ready' ? 'Ready' : snapshot.mode}
            </span>
          </div>
          <p className="theme-muted text-xs">Пространственная головоломка</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="mr-1 hidden text-right sm:block lg:hidden">
          <span className="theme-subtle block text-[9px] uppercase tracking-[.16em]">
            Счёт
          </span>
          <strong className="font-mono text-sm tabular-nums">
            {snapshot.score.toLocaleString('ru-RU')}
          </strong>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="game-stat"
          aria-label="Начать заново"
          onClick={restart}
          disabled={snapshot.status === 'ready'}
        >
          <RotateCcw />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="game-stat"
          aria-label={snapshot.status === 'paused' ? 'Продолжить' : 'Пауза'}
          onClick={togglePause}
          disabled={!canPause}
        >
          {snapshot.status === 'paused' ? <Play /> : <Pause />}
        </Button>
      </div>
    </header>
  );
}

export function SessionSidebar({
  snapshot,
}: {
  readonly snapshot: GameSnapshot;
}) {
  return (
    <aside className="game-sidebar hidden border-r p-6 lg:block">
      <p className="theme-cyan text-[10px] uppercase tracking-[.22em]">
        Сессия
      </p>
      <div className="game-stat mt-5 rounded-2xl border p-4">
        <Metric
          label="Счёт"
          value={snapshot.score.toLocaleString('ru-RU')}
          large
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="game-stat rounded-2xl border p-3">
          <Metric
            label="Режим"
            value={snapshot.mode === 'focus' ? 'Focus' : 'Hard'}
          />
        </div>
        <div className="game-stat rounded-2xl border p-3">
          <Metric
            label="Слои"
            value={String(snapshot.layers).padStart(2, '0')}
          />
        </div>
      </div>
      <div className="game-stat mt-3 grid grid-cols-2 gap-3 rounded-2xl border p-3">
        <Metric
          label="Фигуры"
          value={String(snapshot.pieces).padStart(2, '0')}
        />
        <Metric label="Высота" value={`${snapshot.height}/${BOARD_SIZE}`} />
      </div>
      <div className="mt-8 h-px bg-gradient-to-r from-cyan-300/20 to-transparent" />
      <p className="theme-muted mt-5 text-sm leading-6">
        Движение следует за камерой. Поверните арену — направления перестроятся
        автоматически.
      </p>
      <div className="theme-subtle mt-6 grid gap-2 text-xs">
        <Hint keys="W A S D" label="движение" />
        <Hint keys="Shift" label="на клетку ниже" />
        <Hint keys="Space" label="бросить" />
      </div>
    </aside>
  );
}

export function NextSidebar({ snapshot }: { readonly snapshot: GameSnapshot }) {
  return (
    <aside className="game-sidebar hidden border-l p-6 lg:block">
      <p className="theme-violet text-[10px] uppercase tracking-[.22em]">
        Очередь фигур
      </p>
      <div className="mt-5 grid gap-2">
        {snapshot.next.map((piece, index) => (
          <div
            key={`${piece}-${index}`}
            className={`game-stat grid place-items-center rounded-2xl border font-mono text-2xl ${index === 0 ? 'theme-violet h-24 border-violet-300/20 bg-violet-300/[.06] shadow-[inset_0_0_32px_rgba(168,85,247,.06)]' : 'theme-subtle h-16'}`}
          >
            {piece}
          </div>
        ))}
      </div>
      <div className="mt-8 h-px bg-gradient-to-r from-violet-300/20 to-transparent" />
      <p className="theme-muted mt-5 text-sm leading-6">
        Тяните арену мышью или пальцем. Колесо и pinch меняют масштаб.
      </p>
    </aside>
  );
}

export function MobileHud({ snapshot }: { readonly snapshot: GameSnapshot }) {
  return (
    <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between lg:hidden">
      <Metric label="Счёт" value={snapshot.score.toLocaleString('ru-RU')} />
      <div className="game-glass theme-violet rounded-full border px-3 py-1.5 text-[9px] uppercase tracking-[.16em] backdrop-blur-md">
        Следующая · <strong>{snapshot.next[0]}</strong>
      </div>
      <Metric label="Слои" value={String(snapshot.layers).padStart(2, '0')} />
    </div>
  );
}

export function DirectionCompass() {
  const basis = useGameStore((state) => state.movementBasis);
  const backward = { dx: -basis.forward.dx, dz: -basis.forward.dz };
  const left = { dx: -basis.right.dx, dz: -basis.right.dz };
  return (
    <div
      className="game-glass pointer-events-none absolute left-3 top-24 z-10 w-28 rounded-2xl border p-2.5 text-center shadow-lg backdrop-blur-md sm:left-4"
      aria-label="Направления движения относительно камеры"
    >
      <p className="theme-subtle text-[8px] uppercase tracking-[.18em]">
        Направления
      </p>
      <div className="mt-2 grid grid-cols-3 items-center gap-1 font-mono text-[9px]">
        <span />
        <CompassKey keyName="W" direction={axisLabel(basis.forward)} />
        <span />
        <CompassKey keyName="A" direction={axisLabel(left)} />
        <span className="theme-cyan">●</span>
        <CompassKey keyName="D" direction={axisLabel(basis.right)} />
        <span />
        <CompassKey keyName="S" direction={axisLabel(backward)} />
        <span />
      </div>
    </div>
  );
}

export function LayerPressureAlert({
  pressure,
}: {
  readonly pressure: LayerPressure | null;
}) {
  if (!pressure || pressure.ratio < 0.72) return null;
  return (
    <output className="game-glass pointer-events-none absolute right-3 top-24 z-10 rounded-xl border border-amber-300/30 px-3 py-2 text-right text-[10px] text-amber-700 shadow-lg backdrop-blur-md dark:text-amber-100 sm:right-4">
      <span className="block uppercase tracking-[.16em]">Почти заполнен</span>
      <strong className="mt-0.5 block font-mono">
        Слой {pressure.layer + 1} · {Math.round(pressure.ratio * 100)}%
      </strong>
    </output>
  );
}

export function MobileControls({ status }: { readonly status: GameStatus }) {
  const moveRelative = useGameStore((state) => state.moveRelative);
  const rotate = useGameStore((state) => state.rotate);
  const drop = useGameStore((state) => state.drop);
  const softDrop = useGameStore((state) => state.softDrop);
  const togglePause = useGameStore((state) => state.togglePause);
  const actionDisabled = status !== 'running';
  const pauseDisabled = status !== 'running' && status !== 'paused';
  return (
    <div className="absolute inset-x-3 bottom-3 z-20 grid grid-cols-[1fr_auto_1fr] items-end gap-2 sm:hidden">
      <div className="game-glass grid grid-cols-3 gap-1 rounded-2xl border p-1.5 shadow-2xl backdrop-blur-xl">
        <span />
        <Control
          icon={<ArrowUp />}
          label="Вперёд"
          disabled={actionDisabled}
          onClick={() => moveRelative('forward')}
        />
        <span />
        <Control
          icon={<ArrowLeft />}
          label="Влево"
          disabled={actionDisabled}
          onClick={() => moveRelative('left')}
        />
        <Control
          icon={<ArrowDown />}
          label="Назад"
          disabled={actionDisabled}
          onClick={() => moveRelative('backward')}
        />
        <Control
          icon={<ArrowRight />}
          label="Вправо"
          disabled={actionDisabled}
          onClick={() => moveRelative('right')}
        />
      </div>
      <div className="grid gap-1">
        <Button
          className="h-11 rounded-xl px-3 shadow-[0_0_24px_rgba(57,221,255,.18)]"
          onClick={drop}
          disabled={actionDisabled}
        >
          Бросить
        </Button>
        <Button
          variant="outline"
          className="game-glass h-9 rounded-xl px-3 text-[11px] backdrop-blur-xl"
          onClick={softDrop}
          disabled={actionDisabled}
        >
          <ChevronsDown /> Ниже
        </Button>
      </div>
      <div className="game-glass grid grid-cols-2 gap-1 rounded-2xl border p-1.5 shadow-2xl backdrop-blur-xl">
        <Control
          icon={<Rotate3D />}
          label="Поворот X"
          disabled={actionDisabled}
          onClick={() => rotate('x')}
        />
        <Control
          icon={<Rotate3D />}
          label="Поворот Y"
          disabled={actionDisabled}
          onClick={() => rotate('y')}
        />
        <Control
          icon={<Rotate3D />}
          label="Поворот Z"
          disabled={actionDisabled}
          onClick={() => rotate('z')}
        />
        <Control
          icon={<Pause />}
          label="Пауза"
          disabled={pauseDisabled}
          onClick={togglePause}
        />
      </div>
    </div>
  );
}

export function TabletHints() {
  return (
    <div className="theme-muted pointer-events-none absolute inset-x-5 bottom-5 hidden flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] sm:flex lg:hidden">
      <Hint keys="W A S D" label="движение" />
      <Hint keys="Q E / ↕" label="поворот" />
      <Hint keys="Shift" label="ниже" />
      <Hint keys="Space" label="бросить" />
    </div>
  );
}

function Metric({
  label,
  value,
  large = false,
}: {
  label: string;
  value: string;
  large?: boolean;
}) {
  return (
    <div>
      <span className="theme-subtle block text-[11px] uppercase tracking-[.16em]">
        {label}
      </span>
      <strong
        className={`mt-1 block font-mono tabular-nums ${large ? 'text-4xl' : 'text-xl'}`}
      >
        {value}
      </strong>
    </div>
  );
}

function Hint({ keys, label }: { label: string; keys: string }) {
  return (
    <span className="flex items-center gap-2">
      <kbd className="game-stat theme-cyan rounded-md border px-2 py-1 font-mono">
        {keys}
      </kbd>
      {label}
    </span>
  );
}

function Control({
  icon,
  label,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="h-11 w-full min-w-10 touch-manipulation"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
    </Button>
  );
}

function CompassKey({
  keyName,
  direction,
}: {
  keyName: string;
  direction: string;
}) {
  return (
    <span className="game-stat rounded-md border px-1 py-1 leading-tight">
      <strong className="theme-cyan block">{keyName}</strong>
      <small className="theme-subtle text-[7px]">{direction}</small>
    </span>
  );
}

function axisLabel(direction: { readonly dx: number; readonly dz: number }) {
  if (direction.dx > 0) return '+X';
  if (direction.dx < 0) return '−X';
  if (direction.dz > 0) return '+Z';
  return '−Z';
}
