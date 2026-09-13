'use client';

import { useEffect } from 'react';
import { Check, LockKeyhole, Palette, Trophy } from 'lucide-react';
import { getAchievement } from '@/src/entities/achievement';
import {
  isSkinUnlocked,
  VOXEL_SKINS,
  type VoxelSkin,
} from '@/src/entities/cosmetic';
import { useProgressionStore } from '../model/progression-store';

export function CosmeticPicker() {
  const unlocked = useProgressionStore((state) => state.unlockedAchievements);
  const selected = useProgressionStore((state) => state.selectedSkin);
  const selectSkin = useProgressionStore((state) => state.selectSkin);

  return (
    <details className="game-stat mt-3 rounded-xl border p-3 text-left">
      <summary className="theme-muted flex cursor-pointer list-none items-center justify-center gap-2 text-xs font-medium">
        <Palette className="size-4" /> Скины фигур
      </summary>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {VOXEL_SKINS.map((skin) => {
          const available = isSkinUnlocked(skin, unlocked);
          return (
            <button
              key={skin.id}
              type="button"
              className={`game-stat rounded-xl border p-2 text-left transition ${available ? 'hover:border-cyan-300/40' : 'cursor-not-allowed opacity-55'} ${selected === skin.id ? 'border-cyan-300/60 ring-1 ring-cyan-300/30' : ''}`}
              disabled={!available}
              onClick={() => selectSkin(skin.id)}
            >
              <SkinSwatches skin={skin} />
              <span className="mt-2 flex items-center justify-between gap-2 text-[11px] font-medium">
                {skin.name}
                {available ? (
                  selected === skin.id && (
                    <Check className="size-3 theme-cyan" />
                  )
                ) : (
                  <LockKeyhole className="size-3" />
                )}
              </span>
              <span className="theme-subtle mt-1 block text-[9px] leading-4">
                {available
                  ? skin.description
                  : getAchievement(skin.unlockAchievement!).description}
              </span>
            </button>
          );
        })}
      </div>
    </details>
  );
}

export function AchievementToast() {
  const lastUnlock = useProgressionStore((state) => state.lastUnlock);
  const dismissUnlock = useProgressionStore((state) => state.dismissUnlock);
  useEffect(() => {
    if (!lastUnlock) return;
    const timer = window.setTimeout(dismissUnlock, 4200);
    return () => window.clearTimeout(timer);
  }, [dismissUnlock, lastUnlock]);
  if (!lastUnlock) return null;
  const achievement = getAchievement(lastUnlock);
  const reward = VOXEL_SKINS.find(
    (skin) => skin.unlockAchievement === achievement.id,
  );
  return (
    <output className="game-dialog pointer-events-none absolute right-3 top-24 z-30 w-64 rounded-2xl border border-amber-300/30 p-3 shadow-2xl backdrop-blur-xl sm:right-4">
      <span className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-100">
        <Trophy className="size-4" /> {achievement.title}
      </span>
      <span className="theme-muted mt-1 block text-[10px]">
        {reward ? `Открыт скин ${reward.name}` : achievement.description}
      </span>
    </output>
  );
}

function SkinSwatches({ skin }: { readonly skin: VoxelSkin }) {
  return (
    <span className="flex gap-1" aria-hidden="true">
      {skin.colors.slice(1, 5).map((color) => (
        <span
          key={color}
          className="h-3 flex-1 rounded-sm"
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  );
}
