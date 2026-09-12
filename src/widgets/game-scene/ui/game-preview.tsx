'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Edges, OrbitControls } from '@react-three/drei';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronsDown,
  Crosshair,
  Flame,
  Pause,
  Play,
  Rotate3D,
  RotateCcw,
} from 'lucide-react';
import { Color, InstancedMesh, Object3D } from 'three';
import { Button } from '@/components/ui/button';
import {
  BOARD_SIZE,
  type GameFeedback as GameFeedbackData,
  type GameMode,
  type RenderCell,
} from '@/src/entities/game';
import { useGameController, useGameStore } from '@/src/features/control-game';
import {
  type ColorScheme,
  useColorScheme,
} from '@/src/shared/lib/use-color-scheme';

const COLORS = [
  '#000000',
  '#39ddff',
  '#ffe16b',
  '#c88cff',
  '#55efbd',
  '#ff6a9d',
  '#749cff',
  '#ffad65',
];

const SCENE_THEMES = {
  dark: {
    background: '#050711',
    floor: '#071522',
    volume: '#55dbff',
    edge: '#74e6ff',
    voxelEdge: '#eaffff',
    grid: '#23657b',
    gridSubtle: '#16303e',
    violetLight: 52,
    cyanLight: 24,
  },
  light: {
    background: '#edf5fa',
    floor: '#d8e9f1',
    volume: '#1689a3',
    edge: '#397b8f',
    voxelEdge: '#ffffff',
    grid: '#6fa4b3',
    gridSubtle: '#b7d1da',
    violetLight: 18,
    cyanLight: 9,
  },
} as const;

function toScene(value: number): number {
  return value - (BOARD_SIZE - 1) / 2;
}

function VoxelInstances({ cells }: { readonly cells: readonly RenderCell[] }) {
  const mesh = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const instance = mesh.current;
    if (!instance) return;
    const helper = new Object3D();
    cells.forEach((cell, index) => {
      helper.position.set(toScene(cell.x), toScene(cell.y), toScene(cell.z));
      helper.updateMatrix();
      instance.setMatrixAt(index, helper.matrix);
      instance.setColorAt(index, new Color(COLORS[cell.color] ?? COLORS[1]));
    });
    instance.instanceMatrix.needsUpdate = true;
    if (instance.instanceColor) instance.instanceColor.needsUpdate = true;
  }, [cells]);

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, Math.max(1, cells.length)]}
      count={cells.length}
    >
      <boxGeometry args={[0.82, 0.82, 0.82]} />
      <meshStandardMaterial
        roughness={0.26}
        metalness={0.16}
        emissive="#05070b"
        emissiveIntensity={0.2}
      />
    </instancedMesh>
  );
}

function ActiveVoxels({
  cells,
  edgeColor,
}: {
  readonly cells: readonly RenderCell[];
  readonly edgeColor: string;
}) {
  return cells.map((cell, index) => {
    const color = COLORS[cell.color] ?? COLORS[1]!;
    return (
      <mesh
        key={`${cell.x}-${cell.y}-${cell.z}-${index}`}
        position={[toScene(cell.x), toScene(cell.y), toScene(cell.z)]}
      >
        <boxGeometry args={[0.88, 0.88, 0.88]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.24}
          roughness={0.18}
          metalness={0.12}
          clearcoat={0.8}
          clearcoatRoughness={0.16}
        />
        <Edges color={edgeColor} threshold={12} />
      </mesh>
    );
  });
}

function GameCube({ colorScheme }: { readonly colorScheme: ColorScheme }) {
  const snapshot = useGameStore((state) => state.snapshot);
  const sceneTheme = SCENE_THEMES[colorScheme];
  const boardCells = useMemo(() => {
    const cells: RenderCell[] = [];
    for (let y = 0; y < BOARD_SIZE; y += 1)
      for (let z = 0; z < BOARD_SIZE; z += 1)
        for (let x = 0; x < BOARD_SIZE; x += 1) {
          const color =
            snapshot.board[x + BOARD_SIZE * (z + BOARD_SIZE * y)] ?? 0;
          if (color) cells.push({ x, y, z, color });
        }
    return cells;
  }, [snapshot.board]);

  const activeCenter = useMemo<[number, number, number]>(() => {
    if (snapshot.active.length === 0) return [0, 0, 0];
    const total: [number, number, number] = [0, 0, 0];
    for (const cell of snapshot.active) {
      total[0] += toScene(cell.x);
      total[1] += toScene(cell.y);
      total[2] += toScene(cell.z);
    }
    return [
      total[0] / snapshot.active.length,
      total[1] / snapshot.active.length,
      total[2] / snapshot.active.length,
    ];
  }, [snapshot.active]);

  return (
    <group>
      <mesh
        position={[0, -BOARD_SIZE / 2 - 0.08, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[7.2, 64]} />
        <meshBasicMaterial
          color={sceneTheme.floor}
          transparent
          opacity={0.74}
          depthWrite={false}
        />
      </mesh>
      <mesh
        position={[0, -BOARD_SIZE / 2 - 0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[5.2, 5.28, 64]} />
        <meshBasicMaterial
          color="#35dfff"
          transparent
          opacity={0.16}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <boxGeometry args={[BOARD_SIZE, BOARD_SIZE, BOARD_SIZE]} />
        <meshBasicMaterial
          color={sceneTheme.volume}
          transparent
          opacity={0.025}
          depthWrite={false}
        />
        <Edges color={sceneTheme.edge} threshold={15} />
      </mesh>
      <gridHelper
        args={[BOARD_SIZE, BOARD_SIZE, sceneTheme.grid, sceneTheme.gridSubtle]}
        position={[0, -BOARD_SIZE / 2, 0]}
      />
      <VoxelInstances cells={boardCells} />
      <ActiveVoxels cells={snapshot.active} edgeColor={sceneTheme.voxelEdge} />
      <pointLight
        position={activeCenter}
        intensity={8}
        color={COLORS[snapshot.active[0]?.color ?? 1] ?? '#39ddff'}
        distance={4.5}
        decay={2}
      />
      {snapshot.ghost.map((cell, index) => (
        <mesh
          key={`${cell.x}-${cell.y}-${cell.z}-${index}`}
          position={[toScene(cell.x), toScene(cell.y), toScene(cell.z)]}
        >
          <boxGeometry args={[0.86, 0.86, 0.86]} />
          <meshBasicMaterial
            color={COLORS[cell.color] ?? COLORS[1]!}
            wireframe
            transparent
            opacity={0.34}
          />
        </mesh>
      ))}
    </group>
  );
}

function CameraControls() {
  const camera = useThree((state) => state.camera);
  const setCameraOrientation = useGameStore(
    (state) => state.setCameraOrientation,
  );

  useEffect(() => {
    setCameraOrientation(camera.position.x, camera.position.z);
  }, [camera, setCameraOrientation]);

  return (
    <OrbitControls
      enablePan={false}
      target={[0, 0.45, 0]}
      minDistance={10}
      maxDistance={20}
      minPolarAngle={0.25}
      maxPolarAngle={1.45}
      dampingFactor={0.08}
      onChange={() =>
        setCameraOrientation(camera.position.x, camera.position.z)
      }
    />
  );
}

export function GamePreview() {
  useGameController();
  const colorScheme = useColorScheme();
  const sceneTheme = SCENE_THEMES[colorScheme];
  const snapshot = useGameStore((state) => state.snapshot);
  const moveRelative = useGameStore((state) => state.moveRelative);
  const rotate = useGameStore((state) => state.rotate);
  const drop = useGameStore((state) => state.drop);
  const softDrop = useGameStore((state) => state.softDrop);
  const togglePause = useGameStore((state) => state.togglePause);
  const restart = useGameStore((state) => state.restart);
  const start = useGameStore((state) => state.start);

  return (
    <main className="h-dvh overflow-hidden p-0 sm:p-4 lg:p-6">
      <div className="game-shell mx-auto grid h-full max-w-[1600px] grid-rows-[auto_minmax(0,1fr)] overflow-hidden backdrop-blur-xl sm:rounded-[1.5rem] sm:border">
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
              <p className="theme-muted text-xs">
                Пространственная головоломка · уровень {snapshot.level}
              </p>
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
              disabled={snapshot.status === 'ready'}
            >
              {snapshot.status === 'paused' ? <Play /> : <Pause />}
            </Button>
          </div>
        </header>

        <section className="grid min-h-0 lg:grid-cols-[210px_minmax(0,1fr)_210px]">
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
                  label="Уровень"
                  value={String(snapshot.level).padStart(2, '0')}
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
              <Metric
                label="Высота"
                value={`${snapshot.height}/${BOARD_SIZE}`}
              />
            </div>
            <div className="mt-8 h-px bg-gradient-to-r from-cyan-300/20 to-transparent" />
            <p className="theme-muted mt-5 text-sm leading-6">
              Движение следует за камерой. Поверните арену — направления
              перестроятся автоматически.
            </p>
            <div className="theme-subtle mt-6 grid gap-2 text-xs">
              <Hint keys="W A S D" label="движение" />
              <Hint keys="Shift" label="на клетку ниже" />
              <Hint keys="Space" label="бросить" />
            </div>
          </aside>

          <div className="game-stage relative min-h-0 overflow-hidden">
            <Canvas
              camera={{ position: [10.5, 9.5, 12.5], fov: 36 }}
              dpr={[1, 1.6]}
              frameloop="demand"
              gl={{ antialias: true, powerPreference: 'high-performance' }}
            >
              <color attach="background" args={[sceneTheme.background]} />
              <fog attach="fog" args={[sceneTheme.background, 18, 30]} />
              <ambientLight intensity={1.35} />
              <directionalLight
                position={[7, 12, 8]}
                intensity={3.2}
                color="#c9faff"
              />
              <pointLight
                position={[-8, 2, -5]}
                intensity={sceneTheme.violetLight}
                color="#874dff"
                distance={25}
                decay={2}
              />
              <pointLight
                position={[8, -2, 5]}
                intensity={sceneTheme.cyanLight}
                color="#28dfff"
                distance={20}
                decay={2}
              />
              <GameCube colorScheme={colorScheme} />
              <CameraControls />
            </Canvas>

            <div className="game-vignette pointer-events-none absolute inset-0" />
            <div className="game-stage-top pointer-events-none absolute inset-x-0 top-0 h-24" />
            <div className="game-stage-bottom pointer-events-none absolute inset-x-0 bottom-0 h-36 sm:h-24" />

            {snapshot.feedback && (
              <>
                <div
                  key={`pulse-${snapshot.feedback.id}`}
                  className="placement-pulse pointer-events-none absolute inset-0"
                />
                <GameFeedback
                  key={snapshot.feedback.id}
                  feedback={snapshot.feedback}
                />
              </>
            )}

            <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between lg:hidden">
              <Metric
                label="Счёт"
                value={snapshot.score.toLocaleString('ru-RU')}
              />
              <div className="game-glass theme-violet rounded-full border px-3 py-1.5 text-[9px] uppercase tracking-[.16em] backdrop-blur-md">
                Следующая · <strong>{snapshot.next[0]}</strong>
              </div>
              <Metric
                label="Слои"
                value={String(snapshot.layers).padStart(2, '0')}
              />
            </div>

            <div className="absolute inset-x-3 bottom-3 z-20 grid grid-cols-[1fr_auto_1fr] items-end gap-2 sm:hidden">
              <div className="game-glass grid grid-cols-3 gap-1 rounded-2xl border p-1.5 shadow-2xl backdrop-blur-xl">
                <span />
                <Control
                  icon={<ArrowUp />}
                  label="Вперёд"
                  onClick={() => moveRelative('forward')}
                />
                <span />
                <Control
                  icon={<ArrowLeft />}
                  label="Влево"
                  onClick={() => moveRelative('left')}
                />
                <Control
                  icon={<ArrowDown />}
                  label="Назад"
                  onClick={() => moveRelative('backward')}
                />
                <Control
                  icon={<ArrowRight />}
                  label="Вправо"
                  onClick={() => moveRelative('right')}
                />
              </div>
              <div className="grid gap-1">
                <Button
                  className="h-11 rounded-xl px-3 shadow-[0_0_24px_rgba(57,221,255,.18)]"
                  onClick={drop}
                >
                  Бросить
                </Button>
                <Button
                  variant="outline"
                  className="game-glass h-9 rounded-xl px-3 text-[11px] backdrop-blur-xl"
                  onClick={softDrop}
                >
                  <ChevronsDown />
                  Ниже
                </Button>
              </div>
              <div className="game-glass grid grid-cols-2 gap-1 rounded-2xl border p-1.5 shadow-2xl backdrop-blur-xl">
                <Control
                  icon={<Rotate3D />}
                  label="Поворот X"
                  onClick={() => rotate('x')}
                />
                <Control
                  icon={<Rotate3D />}
                  label="Поворот Y"
                  onClick={() => rotate('y')}
                />
                <Control
                  icon={<Rotate3D />}
                  label="Поворот Z"
                  onClick={() => rotate('z')}
                />
                <Control icon={<Pause />} label="Пауза" onClick={togglePause} />
              </div>
            </div>

            <div className="theme-muted pointer-events-none absolute inset-x-5 bottom-5 hidden flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] sm:flex lg:hidden">
              <Hint keys="W A S D" label="движение" />
              <Hint keys="Q E / ↕" label="поворот" />
              <Hint keys="Shift" label="ниже" />
              <Hint keys="Space" label="бросить" />
            </div>

            {snapshot.status === 'ready' && <ReadyOverlay onStart={start} />}

            {(snapshot.status === 'paused' ||
              snapshot.status === 'game-over') && (
              <div className="game-overlay absolute inset-0 z-40 grid place-items-center p-6 backdrop-blur-md">
                <div className="game-dialog w-full max-w-sm rounded-3xl border p-7 text-center shadow-[0_28px_90px_rgba(0,0,0,.3)]">
                  <p className="theme-cyan text-xs uppercase tracking-[.22em]">
                    {snapshot.status === 'game-over' ? 'Куб заполнен' : 'Пауза'}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold">
                    {snapshot.status === 'game-over'
                      ? 'Партия завершена'
                      : 'Остановили время'}
                  </h2>
                  <p className="theme-muted mt-2 text-sm leading-6">
                    Счёт: {snapshot.score.toLocaleString('ru-RU')}
                  </p>
                  <Button
                    className="mt-6 w-full"
                    onClick={
                      snapshot.status === 'game-over' ? restart : togglePause
                    }
                  >
                    {snapshot.status === 'game-over' ? (
                      <>
                        <RotateCcw />
                        Новая игра
                      </>
                    ) : (
                      <>
                        <Play />
                        Продолжить
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

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
        </section>
      </div>
    </main>
  );
}

function GameFeedback({ feedback }: { feedback: GameFeedbackData }) {
  const isClear = feedback.kind === 'clear';
  return (
    <output
      className={`game-feedback game-glass pointer-events-none absolute inset-x-0 top-16 z-20 mx-auto w-fit rounded-full border px-4 py-2 text-center text-xs font-medium shadow-2xl backdrop-blur-xl ${isClear ? 'border-amber-300/30 text-amber-700 dark:text-amber-100' : 'theme-cyan'}`}
      aria-live="polite"
    >
      {isClear
        ? `${feedback.clearedLayers > 1 ? `${feedback.clearedLayers} слоя` : 'Слой'} очищен · +${feedback.points}`
        : `Фигура установлена${feedback.points > 0 ? ` · +${feedback.points}` : ''}`}
    </output>
  );
}

function ReadyOverlay({
  onStart,
}: {
  readonly onStart: (mode: GameMode) => void;
}) {
  return (
    <div className="game-overlay pointer-events-none absolute inset-0 z-40 grid place-items-center p-4 backdrop-blur-sm sm:p-6">
      <div className="game-dialog pointer-events-auto w-full max-w-xl rounded-[1.75rem] border p-5 shadow-[0_30px_100px_rgba(0,0,0,.32)] sm:p-7">
        <div className="text-center">
          <p className="theme-cyan text-[10px] uppercase tracking-[.24em]">
            Пространство готово
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Выберите свой темп
          </h2>
          <p className="theme-muted mx-auto mt-2 max-w-md text-sm leading-6">
            Сначала поверните куб и найдите удобный ракурс. Таймер начнётся
            только после выбора режима.
          </p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="group rounded-2xl border border-cyan-300/25 bg-cyan-300/[.07] p-4 text-left transition hover:border-cyan-200/45 hover:bg-cyan-300/[.11] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
            onClick={() => onStart('focus')}
          >
            <span className="flex items-center justify-between">
              <span className="theme-cyan grid size-9 place-items-center rounded-xl bg-cyan-300/12">
                <Crosshair />
              </span>
              <span className="theme-cyan rounded-full bg-cyan-300/12 px-2 py-1 text-[9px] uppercase tracking-[.16em]">
                Рекомендуем
              </span>
            </span>
            <strong className="mt-4 block text-lg">Focus</strong>
            <span className="theme-muted mt-1 block text-xs leading-5">
              Спокойнее падение, три следующие фигуры и проекция точки посадки.
            </span>
          </button>
          <button
            type="button"
            className="group rounded-2xl border border-rose-300/15 bg-rose-300/[.035] p-4 text-left transition hover:border-rose-300/35 hover:bg-rose-300/[.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/50"
            onClick={() => onStart('hardcore')}
          >
            <span className="flex items-center justify-between">
              <span className="theme-rose grid size-9 place-items-center rounded-xl bg-rose-300/10">
                <Flame />
              </span>
              <span className="theme-rose text-[9px] uppercase tracking-[.16em] opacity-70">
                Без страховки
              </span>
            </span>
            <strong className="mt-4 block text-lg">Hardcore</strong>
            <span className="theme-muted mt-1 block text-xs leading-5">
              Быстрее гравитация, одна следующая фигура и никакой
              ghost-проекции.
            </span>
          </button>
        </div>
        <p className="theme-subtle mt-4 text-center text-[11px]">
          WASD — движение · мышь — камера · Space — бросить
        </p>
      </div>
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
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="h-11 w-full min-w-10 touch-manipulation"
      aria-label={label}
      onClick={onClick}
    >
      {icon}
    </Button>
  );
}
