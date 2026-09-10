'use client';

import { useEffect } from 'react';
import { useGameStore } from './game-store';

declare global {
  interface Document {
    readonly modelContext?: {
      registerTool(
        tool: {
          name: string;
          title: string;
          description: string;
          inputSchema: object;
          execute(input: unknown): unknown;
          annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
        },
        options?: { signal?: AbortSignal },
      ): void | Promise<void>;
    };
  }
}

export function useGameController(): void {
  const tick = useGameStore((state) => state.tick);
  const moveRelative = useGameStore((state) => state.moveRelative);
  const rotate = useGameStore((state) => state.rotate);
  const drop = useGameStore((state) => state.drop);
  const togglePause = useGameStore((state) => state.togglePause);
  const pause = useGameStore((state) => state.pause);
  const restart = useGameStore((state) => state.restart);

  useEffect(() => {
    const timer = window.setInterval(tick, 50);
    return () => window.clearInterval(timer);
  }, [tick]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.repeat &&
        !['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)
      )
        return;
      const actions: Partial<Record<string, () => void>> = {
        KeyA: () => moveRelative('left'),
        KeyD: () => moveRelative('right'),
        KeyW: () => moveRelative('forward'),
        KeyS: () => moveRelative('backward'),
        ArrowUp: () => rotate('x', 1),
        ArrowDown: () => rotate('x', -1),
        ArrowLeft: () => rotate('z', -1),
        ArrowRight: () => rotate('z', 1),
        KeyQ: () => rotate('y', -1),
        KeyE: () => rotate('y', 1),
        Space: drop,
        KeyP: togglePause,
        Escape: togglePause,
      };
      const action = actions[event.code];
      if (action) {
        event.preventDefault();
        action();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drop, moveRelative, rotate, togglePause]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) pause();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [pause]);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(
      context.registerTool(
        {
          name: 'start_new_game',
          title: 'Начать новую игру',
          description:
            'Сбрасывает текущую партию Voxel Drop и сразу начинает новую.',
          inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: false,
          },
          execute: () => {
            restart();
            return { status: 'running' };
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => undefined);
    return () => lifecycle.abort();
  }, [restart]);
}
