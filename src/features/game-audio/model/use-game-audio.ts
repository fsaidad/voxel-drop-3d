'use client';

import { useEffect, useRef } from 'react';
import type { GameSnapshot } from '@/src/entities/game';
import { gameAudio } from './audio-engine';
import { useAudioSettings } from './audio-store';

export function useGameAudio(snapshot: GameSnapshot): void {
  const enabled = useAudioSettings((state) => state.enabled);
  const lastFeedback = useRef<number | null>(null);
  const previousStatus = useRef(snapshot.status);

  useEffect(() => {
    const unlock = () => gameAudio.unlock();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => {
    const previous = previousStatus.current;
    previousStatus.current = snapshot.status;
    if (!enabled || previous === snapshot.status) return;
    if (snapshot.status === 'running' && previous === 'ready')
      gameAudio.play('start');
    if (snapshot.status === 'game-over') gameAudio.play('game-over');
  }, [enabled, snapshot.status]);

  useEffect(() => {
    const feedback = snapshot.feedback;
    if (!feedback || lastFeedback.current === feedback.id) return;
    lastFeedback.current = feedback.id;
    if (enabled) gameAudio.play(feedback.kind);
  }, [enabled, snapshot.feedback]);
}
