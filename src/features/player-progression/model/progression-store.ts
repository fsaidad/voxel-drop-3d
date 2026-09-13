'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  ACHIEVEMENTS,
  evaluateAchievements,
  type AchievementId,
  type ProgressMetrics,
} from '@/src/entities/achievement';
import {
  getVoxelSkin,
  isSkinUnlocked,
  VOXEL_SKINS,
  type SkinId,
} from '@/src/entities/cosmetic';

const EMPTY_METRICS: ProgressMetrics = {
  piecesPlaced: 0,
  layersCleared: 0,
  bestScore: 0,
};

interface ProgressionStore {
  readonly metrics: ProgressMetrics;
  readonly unlockedAchievements: readonly AchievementId[];
  readonly selectedSkin: SkinId;
  readonly lastUnlock: AchievementId | null;
  readonly recordPlacement: (clearedLayers: number, score: number) => void;
  readonly selectSkin: (skin: SkinId) => void;
  readonly dismissUnlock: () => void;
}

const achievementIds = new Set(ACHIEVEMENTS.map(({ id }) => id));
const skinIds = new Set(VOXEL_SKINS.map(({ id }) => id));

export const useProgressionStore = create<ProgressionStore>()(
  persist(
    (set, get) => ({
      metrics: EMPTY_METRICS,
      unlockedAchievements: [],
      selectedSkin: 'spectrum',
      lastUnlock: null,
      recordPlacement: (clearedLayers, score) => {
        const state = get();
        const metrics: ProgressMetrics = {
          piecesPlaced: state.metrics.piecesPlaced + 1,
          layersCleared: state.metrics.layersCleared + clearedLayers,
          bestScore: Math.max(state.metrics.bestScore, score),
        };
        const unlocked = evaluateAchievements(
          metrics,
          state.unlockedAchievements,
        );
        set({
          metrics,
          unlockedAchievements: [...state.unlockedAchievements, ...unlocked],
          lastUnlock: unlocked[0] ?? null,
        });
      },
      selectSkin: (skinId) => {
        const state = get();
        const skin = getVoxelSkin(skinId);
        if (isSkinUnlocked(skin, state.unlockedAchievements))
          set({ selectedSkin: skin.id });
      },
      dismissUnlock: () => set({ lastUnlock: null }),
    }),
    {
      name: 'voxel-drop-progression',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ metrics, selectedSkin, unlockedAchievements }) => ({
        metrics,
        selectedSkin,
        unlockedAchievements,
      }),
      merge: (persisted, current) => {
        const stored = persisted as Partial<ProgressionStore>;
        const unlockedAchievements = Array.isArray(stored.unlockedAchievements)
          ? stored.unlockedAchievements.filter((id): id is AchievementId =>
              achievementIds.has(id),
            )
          : [];
        const requestedSkin = skinIds.has(stored.selectedSkin as SkinId)
          ? (stored.selectedSkin as SkinId)
          : 'spectrum';
        const selectedSkin = isSkinUnlocked(
          getVoxelSkin(requestedSkin),
          unlockedAchievements,
        )
          ? requestedSkin
          : 'spectrum';
        const metrics = stored.metrics;
        return {
          ...current,
          metrics: {
            piecesPlaced: safeCount(metrics?.piecesPlaced),
            layersCleared: safeCount(metrics?.layersCleared),
            bestScore: safeCount(metrics?.bestScore),
          },
          unlockedAchievements,
          selectedSkin,
        };
      },
    },
  ),
);

function safeCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : 0;
}
