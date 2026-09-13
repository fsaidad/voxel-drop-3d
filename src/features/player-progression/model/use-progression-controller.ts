'use client';

import { useEffect, useRef } from 'react';
import type { GameSnapshot } from '@/src/entities/game';
import { useProgressionStore } from './progression-store';

export function useProgressionController(
  snapshot: GameSnapshot,
  tutorialActive: boolean,
): void {
  const lastFeedback = useRef<number | null>(null);
  const recordPlacement = useProgressionStore((state) => state.recordPlacement);

  useEffect(() => {
    if (!snapshot.feedback) {
      lastFeedback.current = null;
      return;
    }
    if (tutorialActive || lastFeedback.current === snapshot.feedback.id) return;
    lastFeedback.current = snapshot.feedback.id;
    recordPlacement(snapshot.feedback.clearedLayers, snapshot.score);
  }, [recordPlacement, snapshot.feedback, snapshot.score, tutorialActive]);
}
