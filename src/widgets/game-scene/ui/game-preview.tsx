'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Edges, OrbitControls } from '@react-three/drei';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Pause, Play, Rotate3D, RotateCcw } from 'lucide-react';
import { Color, InstancedMesh, Object3D } from 'three';
import { Button } from '@/components/ui/button';
import { BOARD_SIZE, type RenderCell } from '@/src/entities/game';
import { useGameController, useGameStore } from '@/src/features/control-game';

const COLORS = ['#000000', '#27d7ff', '#ffd65a', '#bc77ff', '#45ebad', '#ff5d91', '#628dff', '#ff9b50'];

function toScene(value: number): number { return value - (BOARD_SIZE - 1) / 2; }

function VoxelInstances({ cells, active = false }: { readonly cells: readonly RenderCell[]; readonly active?: boolean }) {
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
    <instancedMesh ref={mesh} args={[undefined, undefined, Math.max(1, cells.length)]} count={cells.length}>
      <boxGeometry args={[active ? 0.84 : 0.8, active ? 0.84 : 0.8, active ? 0.84 : 0.8]} />
      <meshStandardMaterial roughness={0.22} metalness={0.12} emissive={active ? '#153c45' : '#05070b'} emissiveIntensity={active ? 0.6 : 0.2} />
    </instancedMesh>
  );
}

function GameCube() {
  const snapshot = useGameStore((state) => state.snapshot);
  const boardCells = useMemo(() => {
    const cells: RenderCell[] = [];
    for (let y = 0; y < BOARD_SIZE; y += 1) for (let z = 0; z < BOARD_SIZE; z += 1) for (let x = 0; x < BOARD_SIZE; x += 1) {
      const color = snapshot.board[x + BOARD_SIZE * (z + BOARD_SIZE * y)] ?? 0;
      if (color) cells.push({ x, y, z, color });
    }
    return cells;
  }, [snapshot.board]);

  return (
    <group>
      <mesh>
        <boxGeometry args={[BOARD_SIZE, BOARD_SIZE, BOARD_SIZE]} />
        <meshBasicMaterial color="#55dbff" transparent opacity={0.018} depthWrite={false} />
        <Edges color="#59dbff" threshold={15} />
      </mesh>
      <gridHelper args={[BOARD_SIZE, BOARD_SIZE, '#23657b', '#16303e']} position={[0, -BOARD_SIZE / 2, 0]} />
      <VoxelInstances cells={boardCells} />
      <VoxelInstances cells={snapshot.active} active />
      {snapshot.ghost.map((cell, index) => (
        <mesh key={`${cell.x}-${cell.y}-${cell.z}-${index}`} position={[toScene(cell.x), toScene(cell.y), toScene(cell.z)]}>
          <boxGeometry args={[0.86, 0.86, 0.86]} />
          <meshBasicMaterial color={COLORS[cell.color] ?? COLORS[1]!} wireframe transparent opacity={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function CameraControls() {
  const camera = useThree((state) => state.camera);
  const setCameraOrientation = useGameStore((state) => state.setCameraOrientation);

  useEffect(() => {
    setCameraOrientation(camera.position.x, camera.position.z);
  }, [camera, setCameraOrientation]);

  return (
    <OrbitControls
      enablePan={false}
      minDistance={11}
      maxDistance={22}
      minPolarAngle={0.25}
      maxPolarAngle={1.45}
      dampingFactor={0.08}
      onChange={() => setCameraOrientation(camera.position.x, camera.position.z)}
    />
  );
}

export function GamePreview() {
  useGameController();
  const snapshot = useGameStore((state) => state.snapshot);
  const moveRelative = useGameStore((state) => state.moveRelative);
  const rotate = useGameStore((state) => state.rotate);
  const drop = useGameStore((state) => state.drop);
  const togglePause = useGameStore((state) => state.togglePause);
  const restart = useGameStore((state) => state.restart);

  return (
    <main className="min-h-dvh p-2 sm:p-5 lg:p-7">
      <div className="mx-auto grid min-h-[calc(100dvh-1rem)] max-w-[1500px] grid-rows-[auto_1fr_auto] overflow-hidden rounded-[1.4rem] border border-cyan-200/15 bg-slate-950/45 shadow-[0_28px_100px_rgba(0,0,0,.45)] backdrop-blur-xl sm:min-h-[calc(100dvh-2.5rem)]">
        <header className="flex items-center justify-between border-b border-white/8 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-cyan-300/30 bg-cyan-300/10 font-mono text-sm font-bold text-cyan-200">VD</span>
            <div><h1 className="font-semibold tracking-tight">Voxel Drop</h1><p className="text-xs text-slate-400">Куб 8 × 8 × 8 · уровень {snapshot.level}</p></div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" aria-label="Начать заново" onClick={restart}><RotateCcw /></Button>
            <Button variant="outline" size="icon" aria-label={snapshot.status === 'paused' ? 'Продолжить' : 'Пауза'} onClick={togglePause}>{snapshot.status === 'paused' ? <Play /> : <Pause />}</Button>
          </div>
        </header>

        <section className="grid min-h-0 lg:grid-cols-[220px_minmax(0,1fr)_220px]">
          <aside className="hidden border-r border-white/8 p-6 lg:block">
            <Metric label="Счёт" value={snapshot.score.toLocaleString('ru-RU')} large />
            <div className="mt-8 grid grid-cols-2 gap-4"><Metric label="Уровень" value={String(snapshot.level).padStart(2, '0')} /><Metric label="Слои" value={String(snapshot.layers).padStart(2, '0')} /></div>
            <div className="mt-10 h-px bg-white/8" />
            <p className="mt-6 text-sm leading-6 text-slate-400">Гравитация всегда направлена вниз. WASD автоматически перестраиваются под текущий ракурс.</p>
          </aside>

          <div className="relative min-h-[56vh] overflow-hidden bg-[#070914]">
            <Canvas camera={{ position: [10.5, 9.5, 12.5], fov: 42 }} dpr={[1, 1.7]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
              <color attach="background" args={['#070914']} />
              <fog attach="fog" args={['#070914', 19, 31]} />
              <ambientLight intensity={1.6} />
              <directionalLight position={[7, 12, 8]} intensity={2.8} color="#bffaff" />
              <pointLight position={[-8, 2, -5]} intensity={45} color="#874dff" distance={25} />
              <GameCube />
              <CameraControls />
            </Canvas>

            <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between lg:hidden">
              <Metric label="Счёт" value={snapshot.score.toLocaleString('ru-RU')} /><Metric label="Слои" value={String(snapshot.layers).padStart(2, '0')} />
            </div>

            {snapshot.status !== 'running' && (
              <div className="absolute inset-0 grid place-items-center bg-slate-950/65 p-6 backdrop-blur-sm">
                <div className="max-w-sm rounded-3xl border border-cyan-200/15 bg-slate-950/90 p-7 text-center shadow-2xl">
                  <p className="text-xs uppercase tracking-[.22em] text-cyan-300">{snapshot.status === 'game-over' ? 'Куб заполнен' : 'Пауза'}</p>
                  <h2 className="mt-3 text-2xl font-semibold">{snapshot.status === 'game-over' ? 'Партия завершена' : 'Передохните'}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">Счёт: {snapshot.score.toLocaleString('ru-RU')}</p>
                  <Button className="mt-6 w-full" onClick={snapshot.status === 'game-over' ? restart : togglePause}>{snapshot.status === 'game-over' ? <><RotateCcw />Новая игра</> : <><Play />Продолжить</>}</Button>
                </div>
              </div>
            )}
          </div>

          <aside className="hidden border-l border-white/8 p-6 lg:block">
            <p className="text-xs uppercase tracking-[.18em] text-slate-500">Следующие</p>
            <div className="mt-4 grid gap-2">{snapshot.next.map((piece, index) => <div key={`${piece}-${index}`} className="grid h-20 place-items-center rounded-2xl border border-white/8 bg-white/[.025] font-mono text-2xl text-violet-300">{piece}</div>)}</div>
            <p className="mt-7 text-sm leading-6 text-slate-400">Тяните куб мышью или пальцем. Масштаб меняется колесом или pinch-жестом.</p>
          </aside>
        </section>

        <footer className="border-t border-white/8 px-3 py-3 sm:px-5">
          <div className="hidden flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-400 sm:flex">
            <Hint keys="W A S D" label="движение" /><Hint keys="Q E" label="поворот Y" /><Hint keys="Стрелки" label="поворот X/Z" /><Hint keys="Space" label="сброс" /><Hint keys="P" label="пауза" />
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:hidden">
            <div className="grid grid-cols-3 gap-1">
              <span /><Control icon={<ArrowUp />} label="Вперёд" onClick={() => moveRelative('forward')} /><span />
              <Control icon={<ArrowLeft />} label="Влево" onClick={() => moveRelative('left')} /><Control icon={<ArrowDown />} label="Назад" onClick={() => moveRelative('backward')} /><Control icon={<ArrowRight />} label="Вправо" onClick={() => moveRelative('right')} />
            </div>
            <Button className="h-14 px-5" onClick={drop}>Сброс</Button>
            <div className="grid grid-cols-2 gap-1"><Control icon={<Rotate3D />} label="Поворот X" onClick={() => rotate('x')} /><Control icon={<Rotate3D />} label="Поворот Y" onClick={() => rotate('y')} /><Control icon={<Rotate3D />} label="Поворот Z" onClick={() => rotate('z')} /><Control icon={<Pause />} label="Пауза" onClick={togglePause} /></div>
          </div>
        </footer>
      </div>
    </main>
  );
}

function Metric({ label, value, large = false }: { label: string; value: string; large?: boolean }) {
  return <div><span className="block text-[11px] uppercase tracking-[.16em] text-slate-500">{label}</span><strong className={`mt-1 block font-mono tabular-nums ${large ? 'text-4xl' : 'text-xl'}`}>{value}</strong></div>;
}

function Hint({ keys, label }: { label: string; keys: string }) {
  return <span className="flex items-center gap-2"><kbd className="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-cyan-200">{keys}</kbd>{label}</span>;
}

function Control({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return <Button variant="outline" size="icon" className="h-11 w-full min-w-10 touch-manipulation" aria-label={label} onClick={onClick}>{icon}</Button>;
}
