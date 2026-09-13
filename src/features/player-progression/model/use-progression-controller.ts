'use client';

import { useEffect, useRef } from 'react';
import type { GameSnapshot } from '@/src/entities/game';
import { useProgressionStore } from './progression-store';

export function useProgressionController(
  snapshot: GameSnapshot,
  tutorialActive: boolean,
  sessionId: number,
): void {
  const lastFeedback = useRef<number | null>(null);
  const lastSession = useRef(0);
  const finishedSession = useRef(0);
  const recordSessionStarted = useProgressionStore(
    (state) => state.recordSessionStarted,
  );
  const recordPlacement = useProgressionStore((state) => state.recordPlacement);
  const recordSessionFinished = useProgressionStore(
    (state) => state.recordSessionFinished,
  );

  useEffect(() => {
    if (tutorialActive || sessionId === 0 || lastSession.current === sessionId)
      return;
    lastSession.current = sessionId;
    recordSessionStarted();
  }, [recordSessionStarted, sessionId, tutorialActive]);

  useEffect(() => {
    if (!snapshot.feedback) {
      lastFeedback.current = null;
      return;
    }
    if (tutorialActive || lastFeedback.current === snapshot.feedback.id) return;
    lastFeedback.current = snapshot.feedback.id;
    recordPlacement(
      snapshot.mode,
      snapshot.feedback.clearedLayers,
      snapshot.score,
    );
  }, [
    recordPlacement,
    snapshot.feedback,
    snapshot.mode,
    snapshot.score,
    tutorialActive,
  ]);

  useEffect(() => {
    if (
      tutorialActive ||
      snapshot.status !== 'game-over' ||
      finishedSession.current === sessionId
    )
      return;
    finishedSession.current = sessionId;
    recordSessionFinished(snapshot.score);
  }, [
    recordSessionFinished,
    sessionId,
    snapshot.score,
    snapshot.status,
    tutorialActive,
  ]);
}
