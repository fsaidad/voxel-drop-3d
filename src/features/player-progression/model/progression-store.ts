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
import type { GameMode } from '@/src/entities/game';

const EMPTY_METRICS: ProgressMetrics = {
  piecesPlaced: 0,
  layersCleared: 0,
  bestScore: 0,
  gamesPlayed: 0,
  hardcorePiecesPlaced: 0,
};

export interface SessionSummary {
  readonly score: number;
  readonly isNewBest: boolean;
  readonly unlockedAchievements: readonly AchievementId[];
}

interface ProgressionStore {
  readonly metrics: ProgressMetrics;
  readonly unlockedAchievements: readonly AchievementId[];
  readonly selectedSkin: SkinId;
  readonly lastUnlock: AchievementId | null;
  readonly lastSession: SessionSummary | null;
  readonly sessionBestBefore: number;
  readonly sessionUnlocks: readonly AchievementId[];
  readonly recordSessionStarted: () => void;
  readonly recordPlacement: (
    mode: GameMode,
    clearedLayers: number,
    score: number,
  ) => void;
  readonly recordSessionFinished: (score: number) => void;
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
      lastSession: null,
      sessionBestBefore: 0,
      sessionUnlocks: [],
      recordSessionStarted: () => {
        const state = get();
        const metrics = {
          ...state.metrics,
          gamesPlayed: state.metrics.gamesPlayed + 1,
        };
        const unlocked = evaluateAchievements(
          metrics,
          state.unlockedAchievements,
        );
        set({
          metrics,
          unlockedAchievements: [...state.unlockedAchievements, ...unlocked],
          lastUnlock: unlocked[0] ?? null,
          lastSession: null,
          sessionBestBefore: state.metrics.bestScore,
          sessionUnlocks: unlocked,
        });
      },
      recordPlacement: (mode, clearedLayers, score) => {
        const state = get();
        const metrics: ProgressMetrics = {
          piecesPlaced: state.metrics.piecesPlaced + 1,
          layersCleared: state.metrics.layersCleared + clearedLayers,
          bestScore: Math.max(state.metrics.bestScore, score),
          gamesPlayed: state.metrics.gamesPlayed,
          hardcorePiecesPlaced:
            state.metrics.hardcorePiecesPlaced + (mode === 'hardcore' ? 1 : 0),
        };
        const unlocked = evaluateAchievements(
          metrics,
          state.unlockedAchievements,
        );
        set({
          metrics,
          unlockedAchievements: [...state.unlockedAchievements, ...unlocked],
          lastUnlock: unlocked[0] ?? null,
          sessionUnlocks: [...state.sessionUnlocks, ...unlocked],
        });
      },
      recordSessionFinished: (score) => {
        const state = get();
        const metrics = {
          ...state.metrics,
          bestScore: Math.max(state.metrics.bestScore, score),
        };
        const unlocked = evaluateAchievements(
          metrics,
          state.unlockedAchievements,
        );
        const sessionUnlocks = [...state.sessionUnlocks, ...unlocked];
        set({
          metrics,
          unlockedAchievements: [...state.unlockedAchievements, ...unlocked],
          lastUnlock: unlocked[0] ?? state.lastUnlock,
          lastSession: {
            score,
            isNewBest: score > state.sessionBestBefore,
            unlockedAchievements: sessionUnlocks,
          },
          sessionUnlocks,
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
      version: 2,
      migrate: (persisted) => persisted as ProgressionStore,
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
            gamesPlayed: safeCount(metrics?.gamesPlayed),
            hardcorePiecesPlaced: safeCount(metrics?.hardcorePiecesPlaced),
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
