'use client';
import { useI18n } from '@/src/shared/i18n';
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
  PIECE_COLORS,
  PIECES,
  type GameStatus,
  type GameSnapshot,
  type LayerPressure,
  type PieceKind,
} from '@/src/entities/game';
import { getVoxelSkin } from '@/src/entities/cosmetic';
import { useGameStore } from '@/src/features/control-game';
import { SoundToggle } from '@/src/features/game-audio';
import { useProgressionStore } from '@/src/features/player-progression';
import { Button } from '@/src/shared/ui';
export function GameHeader({
  snapshot,
  onOpenProfile,
}: {
  readonly snapshot: GameSnapshot;
  readonly onOpenProfile: () => void;
}) {
  const { t, locale, language, setLanguage } = useI18n();
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
        <p className="theme-muted hidden text-xs min-[400px]:block">
          {t('Тетрис в объёме 8 × 8 × 8')}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="mr-1 hidden text-right sm:block lg:hidden">
          <span className="theme-subtle block text-[9px] uppercase tracking-[.16em]">
            {t('Счёт') + ' '}
          </span>
          <strong className="font-mono text-sm tabular-nums">
            {snapshot.score.toLocaleString(locale)}
          </strong>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="game-stat font-mono text-[10px]"
          aria-label={
            language === 'en' ? 'Switch to Russian' : 'Switch to English'
          }
          onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
        >
          {language === 'en' ? 'RU' : 'EN'}
        </Button>
        <SoundToggle />
        <Button
          variant="outline"
          size="icon"
          className="game-stat"
          aria-label={t('Открыть профиль')}
          onClick={onOpenProfile}
          disabled={snapshot.status === 'game-over'}
        >
          <UserRound />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="game-stat"
          aria-label={t('Начать заново')}
          onClick={restart}
          disabled={snapshot.status === 'ready'}
        >
          <RotateCcw />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="game-stat"
          aria-label={
            snapshot.status === 'paused' ? t('Продолжить') : t('Пауза')
          }
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
  const { t, locale } = useI18n();
  return (
    <aside className="game-sidebar hidden border-r p-6 lg:block">
      <p className="theme-cyan font-mono text-[10px]">{t('01 / СЕССИЯ')}</p>
      <div className="mt-5 border-y py-4">
        <Metric
          label={t('Счёт')}
          value={snapshot.score.toLocaleString(locale)}
          large
        />
      </div>
      <div className="grid grid-cols-2 border-b">
        <div className="border-r py-3 pr-3">
          <Metric
            label={t('Режим')}
            value={snapshot.mode === 'focus' ? 'Focus' : 'Hard'}
          />
        </div>
        <div className="py-3 pl-3">
          <Metric
            label={t('Слои')}
            value={String(snapshot.layers).padStart(2, '0')}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 border-b">
        <div className="border-r py-3 pr-3">
          <Metric
            label={t('Фигуры')}
            value={String(snapshot.pieces).padStart(2, '0')}
          />
        </div>
        <div className="py-3 pl-3">
          <Metric
            label={t('Высота')}
            value={`${snapshot.height}/${BOARD_SIZE}`}
          />
        </div>
      </div>
      <div className="mt-8 h-px bg-gradient-to-r from-cyan-300/20 to-transparent" />
      <p className="theme-muted mt-5 text-sm leading-6">
        {t(
          'Движение следует за камерой. Поверните арену \u2014 направления перестроятся автоматически.',
        ) + ' '}
      </p>
      <div className="theme-subtle mt-6 grid gap-2 text-xs">
        <Hint keys="W A S D" label={t('движение')} />
        <Hint keys="Shift" label={t('на клетку ниже')} />
        <Hint keys="C" label={t('удержать')} />
        <Hint keys="Space" label={t('бросить')} />
      </div>
    </aside>
  );
}
export function NextSidebar({ snapshot }: { readonly snapshot: GameSnapshot }) {
  const { t } = useI18n();
  const selectedSkin = useProgressionStore((state) => state.selectedSkin);
  const skin = getVoxelSkin(selectedSkin);
  return (
    <aside className="game-sidebar hidden border-l p-6 lg:block">
      <p className="theme-cyan font-mono text-[10px]">HOLD / C</p>
      <div className="mt-3 grid h-20 place-items-center border-y">
        {snapshot.hold ? (
          <>
            <PiecePreview
              kind={snapshot.hold}
              color={skin.colors[PIECE_COLORS[snapshot.hold]]!}
            />
            <span className="sr-only">
              {t('Фигура') + ' '}
              {snapshot.hold}
            </span>
          </>
        ) : (
          <span className="theme-subtle font-mono text-[10px]">
            {t('ПУСТО')}
          </span>
        )}
      </div>
      <p className="theme-violet mt-6 font-mono text-[10px]">
        {t('02 / ОЧЕРЕДЬ')}
      </p>
      <div className="mt-3 border-y">
        {snapshot.next.map((piece, index) => (
          <div
            key={`${piece}-${index}`}
            className={`grid grid-cols-[2rem_1fr_auto] items-center border-b px-2 last:border-b-0 ${index === 0 ? 'theme-violet h-20 bg-violet-300/[.045]' : 'theme-subtle h-14'}`}
          >
            <span className="font-mono text-[9px]">0{index + 1}</span>
            <PiecePreview
              kind={piece}
              color={skin.colors[PIECE_COLORS[piece]]!}
            />
            <strong className="font-mono text-sm">{piece}</strong>
          </div>
        ))}
      </div>
      <div className="mt-8 h-px bg-gradient-to-r from-violet-300/20 to-transparent" />
      <p className="theme-muted mt-5 text-sm leading-6">
        {t('Тяните арену мышью или пальцем. Колесо и pinch меняют масштаб.') +
          ' '}
      </p>
    </aside>
  );
}
export function MobileHud({ snapshot }: { readonly snapshot: GameSnapshot }) {
  const { t, locale } = useI18n();
  return (
    <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between lg:hidden">
      <Metric label={t('Счёт')} value={snapshot.score.toLocaleString(locale)} />
      <div className="game-glass theme-violet border px-3 py-1.5 font-mono text-[9px]">
        H / <strong>{snapshot.hold ?? '—'}</strong> · N /{' '}
        <strong>{snapshot.next[0]}</strong>
      </div>
      <Metric
        label={t('Слои')}
        value={String(snapshot.layers).padStart(2, '0')}
      />
    </div>
  );
}
export function DirectionCompass() {
  const { t } = useI18n();
  const basis = useGameStore((state) => state.movementBasis);
  const backward = { dx: -basis.forward.dx, dz: -basis.forward.dz };
  const left = { dx: -basis.right.dx, dz: -basis.right.dz };
  return (
    <div
      className="game-glass pointer-events-none absolute left-3 top-24 z-10 w-28 rounded-md border p-2.5 text-center sm:left-4"
      aria-label={t('Направления движения относительно камеры')}
    >
      <p className="theme-subtle font-mono text-[8px]">{t('КАМЕРА / ХОД')}</p>
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
  const { t } = useI18n();
  const tallStack = height >= BOARD_SIZE - 2;
  const denseLayer = pressure !== null && pressure.ratio >= 0.72;
  if (!tallStack && !denseLayer) return null;
  return (
    <output className="danger-signal game-glass pointer-events-none absolute right-3 top-24 z-10 rounded-md border border-rose-400/40 px-3 py-2 text-right text-[10px] text-rose-700 dark:text-rose-200 sm:right-4">
      <span className="block font-mono">{t('КРИТИЧЕСКАЯ ЗОНА')}</span>
      <strong className="mt-0.5 block font-mono">
        {denseLayer && pressure
          ? `${t('Слой')} ${pressure.layer + 1} · ${Math.round(pressure.ratio * 100)}%`
          : `${t('Высота')} ${height}/${BOARD_SIZE}`}
      </strong>
    </output>
  );
}
export function MobileControls({
  status,
  canHold,
}: {
  readonly status: GameStatus;
  readonly canHold: boolean;
}) {
  const { t } = useI18n();
  const moveRelative = useGameStore((state) => state.moveRelative);
  const rotate = useGameStore((state) => state.rotate);
  const drop = useGameStore((state) => state.drop);
  const softDrop = useGameStore((state) => state.softDrop);
  const hold = useGameStore((state) => state.hold);
  const togglePause = useGameStore((state) => state.togglePause);
  const actionDisabled = status !== 'running';
  const pauseDisabled = status !== 'running' && status !== 'paused';
  return (
    <div className="absolute inset-x-3 bottom-3 z-20 grid grid-cols-[1fr_auto_1fr] items-end gap-2 sm:hidden">
      <div className="game-glass grid grid-cols-3 gap-1 rounded-md border p-1.5">
        <span />
        <Control
          icon={<ArrowUp />}
          label={t('Вперёд')}
          disabled={actionDisabled}
          onClick={() => moveRelative('forward')}
        />
        <span />
        <Control
          icon={<ArrowLeft />}
          label={t('Влево')}
          disabled={actionDisabled}
          onClick={() => moveRelative('left')}
        />
        <Control
          icon={<ArrowDown />}
          label={t('Назад')}
          disabled={actionDisabled}
          onClick={() => moveRelative('backward')}
        />
        <Control
          icon={<ArrowRight />}
          label={t('Вправо')}
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
          {t('Бросить') + ' '}
        </Button>
        <Button
          variant="outline"
          className="game-glass h-9 rounded-md px-3 text-[11px]"
          onClick={softDrop}
          disabled={actionDisabled}
        >
          <ChevronsDown />
          {' ' + t('Ниже') + ' '}
        </Button>
        <Button
          variant="outline"
          className="game-glass h-8 rounded-md px-3 font-mono text-[10px]"
          onClick={hold}
          disabled={actionDisabled || !canHold}
        >
          C · Hold
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
          aria-label={t('Пауза')}
          disabled={pauseDisabled}
          onClick={togglePause}
        >
          <Pause />
          {' ' + t('Пауза') + ' '}
        </Button>
      </div>
    </div>
  );
}
export function TabletHints() {
  const { t } = useI18n();
  return (
    <div className="theme-muted pointer-events-none absolute inset-x-5 bottom-5 hidden flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] sm:flex lg:hidden">
      <Hint keys="W A S D" label={t('движение')} />
      <Hint keys="Q E / ↕" label={t('поворот')} />
      <Hint keys="Shift" label={t('ниже')} />
      <Hint keys="C" label="hold" />
      <Hint keys="Space" label={t('бросить')} />
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
  const { t } = useI18n();
  const sign = direction > 0 ? '+' : '−';
  return (
    <Button
      variant="outline"
      size="icon-xs"
      className="h-7 w-full font-mono text-[10px]"
      aria-label={`${t('Поворот')} ${axis} ${direction > 0 ? t('вперёд') : t('назад')}`}
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
function PiecePreview({
  kind,
  color,
}: {
  readonly kind: PieceKind;
  readonly color: string;
}) {
  const cells = PIECES[kind];
  const projected = cells.map((cell) => ({
    left: (cell.x + 2) * 10 + (cell.z + 1) * 5,
    top: (1 - cell.y) * 10 + (cell.z + 1) * 4,
  }));
  return (
    <span className="relative block h-10 w-16" aria-hidden="true">
      {projected.map((cell, index) => (
        <span
          key={`${cell.left}-${cell.top}-${index}`}
          className="absolute size-2.5 border border-white/45 shadow-[1px_1px_0_rgba(0,0,0,.15)]"
          style={{ left: cell.left, top: cell.top, backgroundColor: color }}
        />
      ))}
    </span>
  );
}
