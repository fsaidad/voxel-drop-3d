export type AchievementId =
  | 'first-placement'
  | 'first-layer'
  | 'voxel-builder'
  | 'layer-architect';

export interface ProgressMetrics {
  readonly piecesPlaced: number;
  readonly layersCleared: number;
  readonly bestScore: number;
}

export interface Achievement {
  readonly id: AchievementId;
  readonly title: string;
  readonly description: string;
  readonly test: (metrics: ProgressMetrics) => boolean;
}

export const ACHIEVEMENTS: readonly Achievement[] = [
  {
    id: 'first-placement',
    title: 'Первый контакт',
    description: 'Установить первую фигуру',
    test: ({ piecesPlaced }) => piecesPlaced >= 1,
  },
  {
    id: 'first-layer',
    title: 'Цельный слой',
    description: 'Впервые очистить горизонтальный слой',
    test: ({ layersCleared }) => layersCleared >= 1,
  },
  {
    id: 'voxel-builder',
    title: 'Воксельный архитектор',
    description: 'Установить 25 фигур',
    test: ({ piecesPlaced }) => piecesPlaced >= 25,
  },
  {
    id: 'layer-architect',
    title: 'Архитектор слоёв',
    description: 'Очистить 10 слоёв',
    test: ({ layersCleared }) => layersCleared >= 10,
  },
];

export function getAchievement(id: AchievementId): Achievement {
  return ACHIEVEMENTS.find((achievement) => achievement.id === id)!;
}

export function evaluateAchievements(
  metrics: ProgressMetrics,
  unlocked: readonly AchievementId[],
): readonly AchievementId[] {
  const known = new Set(unlocked);
  return ACHIEVEMENTS.filter(
    (achievement) => !known.has(achievement.id) && achievement.test(metrics),
  ).map(({ id }) => id);
}
