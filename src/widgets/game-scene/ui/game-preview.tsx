'use client';

import { lazy, Suspense } from 'react';
import { useGameController, useGameStore } from '@/src/features/control-game';
import {
  DirectionCompass,
  GameHeader,
  LayerPressureAlert,
  MobileControls,
  MobileHud,
  NextSidebar,
  SessionSidebar,
  TabletHints,
} from './game-hud';
import { GameFeedback, ReadyOverlay, StatusOverlay } from './game-overlays';

const GameCanvas = lazy(() =>
  import('./game-canvas').then((module) => ({ default: module.GameCanvas })),
);

export function GamePreview() {
  useGameController();
  const snapshot = useGameStore((state) => state.snapshot);
  const start = useGameStore((state) => state.start);
  const restart = useGameStore((state) => state.restart);
  const togglePause = useGameStore((state) => state.togglePause);

  return (
    <main className="h-dvh overflow-hidden p-0 sm:p-4 lg:p-6">
      <div className="game-shell mx-auto grid h-full max-w-[1600px] grid-rows-[auto_minmax(0,1fr)] overflow-hidden backdrop-blur-xl sm:rounded-[1.5rem] sm:border">
        <GameHeader snapshot={snapshot} />
        <section className="grid min-h-0 lg:grid-cols-[210px_minmax(0,1fr)_210px]">
          <SessionSidebar snapshot={snapshot} />
          <div className="game-stage relative min-h-0 overflow-hidden">
            <Suspense fallback={<CanvasFallback />}>
              <GameCanvas />
            </Suspense>
            <div className="game-vignette pointer-events-none absolute inset-0" />
            <div className="game-stage-top pointer-events-none absolute inset-x-0 top-0 h-24" />
            <div className="game-stage-bottom pointer-events-none absolute inset-x-0 bottom-0 h-36 sm:h-24" />
            {snapshot.feedback && (
              <GameFeedback
                key={snapshot.feedback.id}
                feedback={snapshot.feedback}
              />
            )}
            <DirectionCompass />
            <LayerPressureAlert pressure={snapshot.layerPressure} />
            <MobileHud snapshot={snapshot} />
            <MobileControls disabled={snapshot.status !== 'running'} />
            <TabletHints />
            {snapshot.status === 'ready' && <ReadyOverlay onStart={start} />}
            <StatusOverlay
              snapshot={snapshot}
              onRestart={restart}
              onTogglePause={togglePause}
            />
          </div>
          <NextSidebar snapshot={snapshot} />
        </section>
      </div>
    </main>
  );
}

function CanvasFallback() {
  return (
    <output className="theme-muted grid h-full min-h-80 place-items-center text-sm">
      Загружаем 3D-сцену…
    </output>
  );
}
