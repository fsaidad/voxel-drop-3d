'use client';

import { lazy, Suspense } from 'react';

const GamePreview = lazy(() =>
  import('@/src/widgets/game-scene').then((module) => ({
    default: module.GamePreview,
  })),
);

export function GameLoader() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-dvh place-items-center text-sm text-slate-400">
          Подготавливаем игровое поле…
        </main>
      }
    >
      <GamePreview />
    </Suspense>
  );
}
