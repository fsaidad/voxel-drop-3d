'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Edges, OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { Color, InstancedMesh, Object3D } from 'three';
import { getVoxelSkin, type VoxelSkin } from '@/src/entities/cosmetic';
import { BOARD_SIZE, type RenderCell } from '@/src/entities/game';
import { useGameStore } from '@/src/features/control-game';
import { useProgressionStore } from '@/src/features/player-progression';
import { type ColorScheme, useColorScheme } from '@/src/shared/lib';

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

function VoxelInstances({
  cells,
  skin,
}: {
  readonly cells: readonly RenderCell[];
  readonly skin: VoxelSkin;
}) {
  const mesh = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const instance = mesh.current;
    if (!instance) return;
    const helper = new Object3D();
    cells.forEach((cell, index) => {
      helper.position.set(toScene(cell.x), toScene(cell.y), toScene(cell.z));
      helper.updateMatrix();
      instance.setMatrixAt(index, helper.matrix);
      instance.setColorAt(
        index,
        new Color(skin.colors[cell.color] ?? skin.colors[1]),
      );
    });
    instance.instanceMatrix.needsUpdate = true;
    if (instance.instanceColor) instance.instanceColor.needsUpdate = true;
  }, [cells, skin]);

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, Math.max(1, cells.length)]}
      count={cells.length}
    >
      <boxGeometry args={[0.82, 0.82, 0.82]} />
      <meshStandardMaterial
        roughness={skin.roughness}
        metalness={skin.metalness}
        emissive="#05070b"
        emissiveIntensity={0.2}
      />
    </instancedMesh>
  );
}

function ActiveVoxels({
  cells,
  edgeColor,
  grounded,
  skin,
}: {
  readonly cells: readonly RenderCell[];
  readonly edgeColor: string;
  readonly grounded: boolean;
  readonly skin: VoxelSkin;
}) {
  return cells.map((cell, index) => {
    const color = skin.colors[cell.color] ?? skin.colors[1]!;
    return (
      <mesh
        key={`${cell.x}-${cell.y}-${cell.z}-${index}`}
        position={[toScene(cell.x), toScene(cell.y), toScene(cell.z)]}
      >
        <boxGeometry args={[0.88, 0.88, 0.88]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={grounded ? 0.42 : 0.24}
          roughness={skin.roughness}
          metalness={skin.metalness}
          clearcoat={skin.clearcoat}
          clearcoatRoughness={0.16}
        />
        <Edges color={grounded ? '#ffd166' : edgeColor} threshold={12} />
      </mesh>
    );
  });
}

function GameCube({ colorScheme }: { readonly colorScheme: ColorScheme }) {
  const snapshot = useGameStore((state) => state.snapshot);
  const tutorialStep = useGameStore((state) => state.tutorialStep);
  const selectedSkin = useProgressionStore((state) => state.selectedSkin);
  const skin = getVoxelSkin(selectedSkin);
  const sceneTheme = SCENE_THEMES[colorScheme];
  const danger = snapshot.height >= BOARD_SIZE - 2;
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
        <Edges color={danger ? '#fb7185' : sceneTheme.edge} threshold={15} />
      </mesh>
      <gridHelper
        args={[BOARD_SIZE, BOARD_SIZE, sceneTheme.grid, sceneTheme.gridSubtle]}
        position={[0, -BOARD_SIZE / 2, 0]}
      />
      <VoxelInstances cells={boardCells} skin={skin} />
      {snapshot.layerPressure && snapshot.layerPressure.ratio >= 0.72 && (
        <mesh
          position={[0, toScene(snapshot.layerPressure.layer) - 0.44, 0]}
          renderOrder={2}
        >
          <boxGeometry args={[BOARD_SIZE - 0.12, 0.045, BOARD_SIZE - 0.12]} />
          <meshBasicMaterial
            color="#ffd166"
            transparent
            opacity={0.08 + snapshot.layerPressure.ratio * 0.12}
            depthWrite={false}
          />
          <Edges color="#ffd166" threshold={15} />
        </mesh>
      )}
      {danger && (
        <mesh
          position={[0, toScene(BOARD_SIZE - 2) - 0.48, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          renderOrder={3}
        >
          <planeGeometry args={[BOARD_SIZE - 0.08, BOARD_SIZE - 0.08]} />
          <meshBasicMaterial
            color="#fb7185"
            transparent
            opacity={0.055}
            depthWrite={false}
          />
        </mesh>
      )}
      <ActiveVoxels
        cells={snapshot.active}
        edgeColor={skin.edge || sceneTheme.voxelEdge}
        grounded={snapshot.grounded}
        skin={skin}
      />
      <TutorialAxisGuide center={activeCenter} step={tutorialStep} />
      <pointLight
        position={activeCenter}
        intensity={8}
        color={skin.colors[snapshot.active[0]?.color ?? 1] ?? '#39ddff'}
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
            color={skin.colors[cell.color] ?? skin.colors[1]!}
            wireframe
            transparent
            opacity={0.34}
          />
        </mesh>
      ))}
    </group>
  );
}

function TutorialAxisGuide({
  center,
  step,
}: {
  readonly center: readonly [number, number, number];
  readonly step: ReturnType<typeof useGameStore.getState>['tutorialStep'];
}) {
  if (step !== 'yaw' && step !== 'tilt') return null;
  const axes =
    step === 'yaw'
      ? ([{ color: '#65f2a5', rotation: [0, 0, 0] }] as const)
      : ([
          { color: '#ff6f7d', rotation: [0, 0, Math.PI / 2] },
          { color: '#65a6ff', rotation: [Math.PI / 2, 0, 0] },
        ] as const);
  return (
    <group position={center} renderOrder={5}>
      {axes.map((axis) => (
        <mesh key={axis.color} rotation={axis.rotation}>
          <cylinderGeometry args={[0.035, 0.035, 3.2, 8]} />
          <meshBasicMaterial
            color={axis.color}
            transparent
            opacity={0.9}
            depthTest={false}
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
  const registerCameraInteraction = useGameStore(
    (state) => state.registerCameraInteraction,
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
      onStart={registerCameraInteraction}
      onChange={() =>
        setCameraOrientation(camera.position.x, camera.position.z)
      }
    />
  );
}

export function GameCanvas() {
  const colorScheme = useColorScheme();
  const sceneTheme = SCENE_THEMES[colorScheme];
  return (
    <Canvas
      camera={{ position: [10.5, 9.5, 12.5], fov: 36 }}
      dpr={[1, 1.6]}
      frameloop="demand"
      fallback={
        <div className="theme-muted grid h-full place-items-center p-6 text-center text-sm">
          Для игры нужна поддержка WebGL.
        </div>
      }
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={[sceneTheme.background]} />
      <fog attach="fog" args={[sceneTheme.background, 18, 30]} />
      <ambientLight intensity={1.35} />
      <directionalLight position={[7, 12, 8]} intensity={3.2} color="#c9faff" />
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
  );
}
