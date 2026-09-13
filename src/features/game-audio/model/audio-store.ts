'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AudioSettingsStore {
  readonly enabled: boolean;
  readonly toggle: () => void;
}

export const useAudioSettings = create<AudioSettingsStore>()(
  persist(
    (set) => ({
      enabled: true,
      toggle: () => set((state) => ({ enabled: !state.enabled })),
    }),
    {
      name: 'voxel-drop-audio',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ enabled }) => ({ enabled }),
    },
  ),
);
