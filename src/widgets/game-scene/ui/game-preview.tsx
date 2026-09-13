'use client';

import { lazy, Suspense, useState } from 'react';
import { useGameController, useGameStore } from '@/src/features/control-game';
import { useGameAudio } from '@/src/features/game-audio';
import {
  AchievementToast,
  ProfileOverlay,
  useProgressionController,
  useProgressionStore,
} from '@/src/features/player-progression';
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
import {
  GameFeedback,
  ReadyOverlay,
  StatusOverlay,
  TutorialOverlay,
} from './game-overlays';

const GameCanvas = lazy(() =>
  import('./game-canvas').then((module) => ({ default: module.GameCanvas })),
);

export function GamePreview() {
  useGameController();
  const snapshot = useGameStore((state) => state.snapshot);
  const resumeCountdown = useGameStore((state) => state.resumeCountdown);
  const tutorialStep = useGameStore((state) => state.tutorialStep);
  const sessionId = useGameStore((state) => state.sessionId);
  const start = useGameStore((state) => state.start);
  const startTutorial = useGameStore((state) => state.startTutorial);
  const finishTutorial = useGameStore((state) => state.finishTutorial);
  const restart = useGameStore((state) => state.restart);
  const returnToMenu = useGameStore((state) => state.returnToMenu);
  const pause = useGameStore((state) => state.pause);
  const togglePause = useGameStore((state) => state.togglePause);
  const lastSession = useProgressionStore((state) => state.lastSession);
  const [profileOpen, setProfileOpen] = useState(false);
  useProgressionController(snapshot, tutorialStep !== null, sessionId);
  useGameAudio(snapshot);

  const openProfile = () => {
    if (snapshot.status === 'running') pause();
    setProfileOpen(true);
  };

  return (
    <main className="h-dvh overflow-hidden p-0 sm:p-4 lg:p-6">
      <div className="game-shell mx-auto grid h-full max-w-[1600px] grid-rows-[auto_minmax(0,1fr)] overflow-hidden sm:rounded-lg sm:border">
        <GameHeader snapshot={snapshot} onOpenProfile={openProfile} />
        <section className="grid min-h-0 lg:grid-cols-[210px_minmax(0,1fr)_210px]">
          <SessionSidebar snapshot={snapshot} />
          <div className="game-stage relative min-h-0 overflow-hidden">
            <Suspense fallback={<CanvasFallback />}>
              <GameCanvas />
            </Suspense>
            <div className="game-vignette pointer-events-none absolute inset-0" />
            <div className="game-stage-top pointer-events-none absolute inset-x-0 top-0 h-24" />
            <div className="game-stage-bottom pointer-events-none absolute inset-x-0 bottom-0 h-36 sm:h-24" />
            {snapshot.height >= 6 && (
              <div
                className="danger-vignette pointer-events-none absolute inset-0"
                aria-hidden="true"
              />
            )}
            {snapshot.feedback && (
              <GameFeedback
                key={snapshot.feedback.id}
                feedback={snapshot.feedback}
              />
            )}
            <AchievementToast />
            <DirectionCompass />
            <LayerPressureAlert
              pressure={snapshot.layerPressure}
              height={snapshot.height}
            />
            <MobileHud snapshot={snapshot} />
            <MobileControls status={snapshot.status} />
            <TabletHints />
            {snapshot.status === 'ready' && (
              <ReadyOverlay onStart={start} onTutorial={startTutorial} />
            )}
            {tutorialStep && (
              <TutorialOverlay step={tutorialStep} onFinish={finishTutorial} />
            )}
            <StatusOverlay
              snapshot={snapshot}
              resumeCountdown={resumeCountdown}
              sessionSummary={lastSession}
              onRestart={restart}
              onReturnToMenu={returnToMenu}
              onTogglePause={togglePause}
            />
          </div>
          <NextSidebar snapshot={snapshot} />
        </section>
      </div>
      {profileOpen && <ProfileOverlay onClose={() => setProfileOpen(false)} />}
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
