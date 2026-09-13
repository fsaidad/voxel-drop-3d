export type AchievementId =
  | 'first-placement'
  | 'first-layer'
  | 'voxel-builder'
  | 'layer-architect'
  | 'hardcore-initiate'
  | 'hardcore-veteran'
  | 'score-hunter';

export interface ProgressMetrics {
  readonly piecesPlaced: number;
  readonly layersCleared: number;
  readonly bestScore: number;
  readonly gamesPlayed: number;
  readonly hardcorePiecesPlaced: number;
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
  {
    id: 'hardcore-initiate',
    title: 'Без страховки',
    description: 'Установить первую фигуру в Hardcore',
    test: ({ hardcorePiecesPlaced }) => hardcorePiecesPlaced >= 1,
  },
  {
    id: 'hardcore-veteran',
    title: 'Холодный расчёт',
    description: 'Установить 25 фигур в Hardcore',
    test: ({ hardcorePiecesPlaced }) => hardcorePiecesPlaced >= 25,
  },
  {
    id: 'score-hunter',
    title: 'Охотник за очками',
    description: 'Набрать 1 000 очков за одну партию',
    test: ({ bestScore }) => bestScore >= 1000,
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
