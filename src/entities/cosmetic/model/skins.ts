export type SkinId = 'spectrum' | 'carbon' | 'aurora';
export type SkinUnlockAchievement = 'first-placement' | 'first-layer';

export interface VoxelSkin {
  readonly id: SkinId;
  readonly name: string;
  readonly description: string;
  readonly colors: readonly string[];
  readonly edge: string;
  readonly roughness: number;
  readonly metalness: number;
  readonly clearcoat: number;
  readonly unlockAchievement: SkinUnlockAchievement | null;
}

export const VOXEL_SKINS: readonly VoxelSkin[] = [
  {
    id: 'spectrum',
    name: 'Spectrum',
    description: 'Оригинальная спектральная палитра',
    colors: [
      '#000000',
      '#39ddff',
      '#ffe16b',
      '#c88cff',
      '#55efbd',
      '#ff6a9d',
      '#749cff',
      '#ffad65',
    ],
    edge: '#eaffff',
    roughness: 0.18,
    metalness: 0.12,
    clearcoat: 0.8,
    unlockAchievement: null,
  },
  {
    id: 'carbon',
    name: 'Carbon',
    description: 'Тёмный металл с холодным свечением',
    colors: [
      '#000000',
      '#718096',
      '#8492a6',
      '#637083',
      '#9aa6b8',
      '#596575',
      '#aab4c2',
      '#778395',
    ],
    edge: '#78e8ff',
    roughness: 0.3,
    metalness: 0.72,
    clearcoat: 0.35,
    unlockAchievement: 'first-placement',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Полярное сияние для мастеров слоёв',
    colors: [
      '#000000',
      '#48f5d2',
      '#75f0a3',
      '#87c6ff',
      '#b68cff',
      '#50e8ff',
      '#d997ff',
      '#91ffd7',
    ],
    edge: '#d9fff7',
    roughness: 0.12,
    metalness: 0.2,
    clearcoat: 1,
    unlockAchievement: 'first-layer',
  },
];

export function getVoxelSkin(id: SkinId): VoxelSkin {
  return VOXEL_SKINS.find((skin) => skin.id === id) ?? VOXEL_SKINS[0]!;
}

export function isSkinUnlocked(
  skin: VoxelSkin,
  achievements: readonly string[],
): boolean {
  return (
    skin.unlockAchievement === null ||
    achievements.includes(skin.unlockAchievement)
  );
}
