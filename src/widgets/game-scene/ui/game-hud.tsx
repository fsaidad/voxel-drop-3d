'use client';

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronsDown,
  Pause,
  Play,
  RotateCcw,
  UserRound,
} from 'lucide-react';
import {
  BOARD_SIZE,
  type GameStatus,
  type GameSnapshot,
  type LayerPressure,
} from '@/src/entities/game';
import { useGameStore } from '@/src/features/control-game';
import { SoundToggle } from '@/src/features/game-audio';
import { Button } from '@/src/shared/ui';

export function GameHeader({
  snapshot,
  onOpenProfile,
}: {
  readonly snapshot: GameSnapshot;
  readonly onOpenProfile: () => void;
}) {
  const togglePause = useGameStore((state) => state.togglePause);
  const restart = useGameStore((state) => state.restart);
  const canPause =
    snapshot.status === 'running' || snapshot.status === 'paused';
  return (
    <header className="game-header relative z-30 flex items-center justify-between border-b px-4 py-3 sm:px-6">
      <div>
        <div className="flex items-baseline gap-3">
          <h1 className="text-base font-bold tracking-[-0.035em]">
            Voxel Drop
          </h1>
          <span
            className={`hidden font-mono text-[10px] sm:inline ${snapshot.mode === 'hardcore' ? 'theme-rose' : 'theme-cyan'}`}
          >
            / {snapshot.status === 'ready' ? 'standby' : snapshot.mode}
          </span>
        </div>
        <p className="theme-muted text-xs">Тетрис в объёме 8 × 8 × 8</p>
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
        <SoundToggle />
        <Button
          variant="outline"
          size="icon"
          className="game-stat"
          aria-label="Открыть профиль"
          onClick={onOpenProfile}
          disabled={snapshot.status === 'game-over'}
        >
          <UserRound />
        </Button>
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
      <p className="theme-cyan font-mono text-[10px]">01 / СЕССИЯ</p>
      <div className="mt-5 border-y py-4">
        <Metric
          label="Счёт"
          value={snapshot.score.toLocaleString('ru-RU')}
          large
        />
      </div>
      <div className="grid grid-cols-2 border-b">
        <div className="border-r py-3 pr-3">
          <Metric
            label="Режим"
            value={snapshot.mode === 'focus' ? 'Focus' : 'Hard'}
          />
        </div>
        <div className="py-3 pl-3">
          <Metric
            label="Слои"
            value={String(snapshot.layers).padStart(2, '0')}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 border-b">
        <div className="border-r py-3 pr-3">
          <Metric
            label="Фигуры"
            value={String(snapshot.pieces).padStart(2, '0')}
          />
        </div>
        <div className="py-3 pl-3">
          <Metric label="Высота" value={`${snapshot.height}/${BOARD_SIZE}`} />
        </div>
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
      <p className="theme-violet font-mono text-[10px]">02 / ОЧЕРЕДЬ</p>
      <div className="mt-5 border-y">
        {snapshot.next.map((piece, index) => (
          <div
            key={`${piece}-${index}`}
            className={`grid place-items-center border-b font-mono text-2xl last:border-b-0 ${index === 0 ? 'theme-violet h-24 bg-violet-300/[.045]' : 'theme-subtle h-16'}`}
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
      <div className="game-glass theme-violet border px-3 py-1.5 font-mono text-[9px]">
        NEXT / <strong>{snapshot.next[0]}</strong>
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
      className="game-glass pointer-events-none absolute left-3 top-24 z-10 w-28 rounded-md border p-2.5 text-center sm:left-4"
      aria-label="Направления движения относительно камеры"
    >
      <p className="theme-subtle font-mono text-[8px]">КАМЕРА / ХОД</p>
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
  height,
}: {
  readonly pressure: LayerPressure | null;
  readonly height: number;
}) {
  const tallStack = height >= BOARD_SIZE - 2;
  const denseLayer = pressure !== null && pressure.ratio >= 0.72;
  if (!tallStack && !denseLayer) return null;
  return (
    <output className="danger-signal game-glass pointer-events-none absolute right-3 top-24 z-10 rounded-md border border-rose-400/40 px-3 py-2 text-right text-[10px] text-rose-700 dark:text-rose-200 sm:right-4">
      <span className="block font-mono">КРИТИЧЕСКАЯ ЗОНА</span>
      <strong className="mt-0.5 block font-mono">
        {denseLayer && pressure
          ? `Слой ${pressure.layer + 1} · ${Math.round(pressure.ratio * 100)}%`
          : `Высота ${height}/${BOARD_SIZE}`}
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
      <div className="game-glass grid grid-cols-3 gap-1 rounded-md border p-1.5">
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
          className="h-11 rounded-md px-3"
          onClick={drop}
          disabled={actionDisabled}
        >
          Бросить
        </Button>
        <Button
          variant="outline"
          className="game-glass h-9 rounded-md px-3 text-[11px]"
          onClick={softDrop}
          disabled={actionDisabled}
        >
          <ChevronsDown /> Ниже
        </Button>
      </div>
      <div className="game-glass grid grid-cols-2 gap-1 rounded-md border p-1.5">
        <AxisControl
          axis="X"
          direction={-1}
          disabled={actionDisabled}
          onClick={() => rotate('x', -1)}
        />
        <AxisControl
          axis="X"
          direction={1}
          disabled={actionDisabled}
          onClick={() => rotate('x', 1)}
        />
        <AxisControl
          axis="Y"
          direction={-1}
          disabled={actionDisabled}
          onClick={() => rotate('y', -1)}
        />
        <AxisControl
          axis="Y"
          direction={1}
          disabled={actionDisabled}
          onClick={() => rotate('y', 1)}
        />
        <AxisControl
          axis="Z"
          direction={-1}
          disabled={actionDisabled}
          onClick={() => rotate('z', -1)}
        />
        <AxisControl
          axis="Z"
          direction={1}
          disabled={actionDisabled}
          onClick={() => rotate('z', 1)}
        />
        <Button
          variant="outline"
          className="col-span-2 h-8 text-[10px]"
          aria-label="Пауза"
          disabled={pauseDisabled}
          onClick={togglePause}
        >
          <Pause /> Пауза
        </Button>
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
      <span className="theme-subtle block text-[11px]">{label}</span>
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

function AxisControl({
  axis,
  direction,
  disabled,
  onClick,
}: {
  axis: 'X' | 'Y' | 'Z';
  direction: 1 | -1;
  disabled: boolean;
  onClick: () => void;
}) {
  const sign = direction > 0 ? '+' : '−';
  return (
    <Button
      variant="outline"
      size="icon-xs"
      className="h-7 w-full font-mono text-[10px]"
      aria-label={`Поворот ${axis} ${direction > 0 ? 'вперёд' : 'назад'}`}
      disabled={disabled}
      onClick={onClick}
    >
      {axis}
      {sign}
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
