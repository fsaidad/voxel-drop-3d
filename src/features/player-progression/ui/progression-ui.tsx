'use client';

import { useEffect, useRef } from 'react';
import { Check, LockKeyhole, Trophy, X } from 'lucide-react';
import { ACHIEVEMENTS, getAchievement } from '@/src/entities/achievement';
import {
  isSkinUnlocked,
  VOXEL_SKINS,
  type VoxelSkin,
} from '@/src/entities/cosmetic';
import { Button } from '@/src/shared/ui';
import { useProgressionStore } from '../model/progression-store';

export function ProfileOverlay({ onClose }: { readonly onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const metrics = useProgressionStore((state) => state.metrics);
  const unlocked = useProgressionStore((state) => state.unlockedAchievements);

  useEffect(() => {
    const current = dialog.current;
    if (!current) return;
    current.showModal();
    return () => current.close();
  }, []);

  return (
    <dialog
      ref={dialog}
      className="game-dialog game-modal m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-3xl border p-0 text-inherit shadow-[0_32px_110px_rgba(0,0,0,.38)]"
      aria-labelledby="profile-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--dialog)] px-5 py-4 backdrop-blur-xl sm:px-7">
        <div>
          <p className="theme-cyan text-[9px] uppercase tracking-[.22em]">
            Локальный профиль
          </p>
          <h2 id="profile-title" className="mt-1 text-xl font-semibold">
            Прогресс игрока
          </h2>
        </div>
        <Button
          variant="outline"
          size="icon"
          aria-label="Закрыть профиль"
          onClick={onClose}
        >
          <X />
        </Button>
      </div>

      <div className="p-5 sm:p-7">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <ProfileMetric
            label="Рекорд"
            value={metrics.bestScore.toLocaleString('ru-RU')}
          />
          <ProfileMetric
            label="Партий"
            value={metrics.gamesPlayed.toLocaleString('ru-RU')}
          />
          <ProfileMetric
            label="Фигур"
            value={metrics.piecesPlaced.toLocaleString('ru-RU')}
          />
          <ProfileMetric
            label="Слоёв"
            value={metrics.layersCleared.toLocaleString('ru-RU')}
          />
        </div>

        <section className="mt-7" aria-labelledby="achievements-title">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="theme-violet text-[9px] uppercase tracking-[.2em]">
                Достижения
              </p>
              <h3 id="achievements-title" className="mt-1 font-semibold">
                Коллекция наград
              </h3>
            </div>
            <span className="theme-muted font-mono text-xs">
              {unlocked.length}/{ACHIEVEMENTS.length}
            </span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {ACHIEVEMENTS.map((achievement) => {
              const available = unlocked.includes(achievement.id);
              return (
                <article
                  key={achievement.id}
                  className={`game-stat flex items-start gap-3 rounded-2xl border p-3 ${available ? '' : 'opacity-50'}`}
                >
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-xl ${available ? 'bg-amber-300/12 text-amber-600 dark:text-amber-200' : 'bg-black/5 theme-subtle dark:bg-white/5'}`}
                  >
                    {available ? <Trophy /> : <LockKeyhole />}
                  </span>
                  <span>
                    <strong className="block text-xs">
                      {achievement.title}
                    </strong>
                    <span className="theme-muted mt-1 block text-[10px] leading-4">
                      {achievement.description}
                    </span>
                  </span>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-7" aria-labelledby="skins-title">
          <p className="theme-cyan text-[9px] uppercase tracking-[.2em]">
            Косметика
          </p>
          <h3 id="skins-title" className="mt-1 font-semibold">
            Скины фигур
          </h3>
          <SkinGrid />
        </section>

        <p className="theme-subtle mt-6 text-center text-[10px]">
          Прогресс хранится только на этом устройстве
        </p>
      </div>
    </dialog>
  );
}

function SkinGrid() {
  const unlocked = useProgressionStore((state) => state.unlockedAchievements);
  const selected = useProgressionStore((state) => state.selectedSkin);
  const selectSkin = useProgressionStore((state) => state.selectSkin);

  return (
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
                selected === skin.id && <Check className="size-3 theme-cyan" />
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
  );
}

function ProfileMetric({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="game-stat rounded-2xl border p-3">
      <span className="theme-subtle text-[9px] uppercase tracking-[.16em]">
        {label}
      </span>
      <strong className="mt-1 block font-mono text-xl tabular-nums">
        {value}
      </strong>
    </div>
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
