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
  const status = useGameStore((state) => state.snapshot.status);
  const tick = useGameStore((state) => state.tick);
  const moveRelative = useGameStore((state) => state.moveRelative);
  const rotate = useGameStore((state) => state.rotate);
  const drop = useGameStore((state) => state.drop);
  const softDrop = useGameStore((state) => state.softDrop);
  const togglePause = useGameStore((state) => state.togglePause);
  const pause = useGameStore((state) => state.pause);
  const restart = useGameStore((state) => state.restart);

  useEffect(() => {
    let frame = 0;
    let previous = performance.now();
    let accumulator = 0;
    const runFrame = (now: number) => {
      accumulator += Math.min(now - previous, 250);
      previous = now;
      while (accumulator >= 50) {
        tick();
        accumulator -= 50;
      }
      frame = window.requestAnimationFrame(runFrame);
    };
    frame = window.requestAnimationFrame(runFrame);
    return () => window.cancelAnimationFrame(frame);
  }, [tick]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isInteractive =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.matches(
            'button, input, textarea, select, a[href], [role="button"]',
          ));
      if (
        event.defaultPrevented ||
        isInteractive ||
        (status !== 'running' && status !== 'paused')
      )
        return;
      if (
        event.repeat &&
        !['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight'].includes(
          event.code,
        )
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
        ShiftLeft: softDrop,
        ShiftRight: softDrop,
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
  }, [drop, moveRelative, rotate, softDrop, status, togglePause]);

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
