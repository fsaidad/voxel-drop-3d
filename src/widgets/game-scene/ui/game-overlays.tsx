'use client';

import { useEffect, useRef } from 'react';
import { Crosshair, Flame, Play, RotateCcw } from 'lucide-react';
import type {
  GameFeedback as Feedback,
  GameMode,
  GameSnapshot,
} from '@/src/entities/game';
import { Button } from '@/src/shared/ui';

export function GameFeedback({ feedback }: { readonly feedback: Feedback }) {
  const isClear = feedback.kind === 'clear';
  return (
    <>
      <div className="placement-pulse pointer-events-none absolute inset-0" />
      <output
        className={`game-feedback game-glass pointer-events-none absolute inset-x-0 top-16 z-20 mx-auto w-fit rounded-full border px-4 py-2 text-center text-xs font-medium shadow-2xl backdrop-blur-xl ${isClear ? 'border-amber-300/30 text-amber-700 dark:text-amber-100' : 'theme-cyan'}`}
        aria-live="polite"
      >
        {isClear
          ? `${feedback.clearedLayers > 1 ? `${feedback.clearedLayers} слоя` : 'Слой'} очищен · +${feedback.points}`
          : `Фигура установлена${feedback.points > 0 ? ` · +${feedback.points}` : ''}`}
      </output>
    </>
  );
}

export function ReadyOverlay({
  onStart,
}: {
  readonly onStart: (mode: GameMode) => void;
}) {
  const primaryAction = useRef<HTMLButtonElement>(null);
  useEffect(() => primaryAction.current?.focus(), []);

  return (
    <div className="game-overlay pointer-events-none absolute inset-0 z-40 grid place-items-center p-4 backdrop-blur-sm sm:p-6">
      <dialog
        open
        className="game-dialog pointer-events-auto relative m-0 max-h-[calc(100dvh-6rem)] w-full max-w-xl overflow-y-auto overscroll-contain rounded-[1.75rem] border p-5 text-inherit shadow-[0_30px_100px_rgba(0,0,0,.32)] sm:p-7"
        aria-modal="false"
        aria-labelledby="ready-title"
      >
        <div className="text-center">
          <p className="theme-cyan text-[10px] uppercase tracking-[.24em]">
            Пространство готово
          </p>
          <h2
            id="ready-title"
            className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Выберите свой темп
          </h2>
          <p className="theme-muted mx-auto mt-2 max-w-md text-sm leading-6">
            Сначала поверните куб и найдите удобный ракурс. Таймер начнётся
            только после выбора режима.
          </p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <ModeButton
            buttonRef={primaryAction}
            mode="focus"
            icon={<Crosshair />}
            badge="Рекомендуем"
            title="Focus"
            description="Спокойнее падение, три следующие фигуры и проекция точки посадки."
            onStart={onStart}
          />
          <ModeButton
            mode="hardcore"
            icon={<Flame />}
            badge="Без страховки"
            title="Hardcore"
            description="Быстрее гравитация, одна следующая фигура и никакой ghost-проекции."
            onStart={onStart}
          />
        </div>
        <p className="theme-subtle mt-4 text-center text-[11px]">
          WASD — движение · мышь — камера · Space — бросить
        </p>
      </dialog>
    </div>
  );
}

function ModeButton({
  mode,
  icon,
  badge,
  title,
  description,
  onStart,
  buttonRef,
}: {
  mode: GameMode;
  icon: React.ReactNode;
  badge: string;
  title: string;
  description: string;
  onStart: (mode: GameMode) => void;
  buttonRef?: React.Ref<HTMLButtonElement>;
}) {
  const focus = mode === 'focus';
  return (
    <button
      ref={buttonRef}
      type="button"
      className={`group rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 ${focus ? 'border-cyan-300/25 bg-cyan-300/[.07] hover:border-cyan-200/45 hover:bg-cyan-300/[.11] focus-visible:ring-cyan-300/60' : 'border-rose-300/15 bg-rose-300/[.035] hover:border-rose-300/35 hover:bg-rose-300/[.07] focus-visible:ring-rose-300/50'}`}
      onClick={() => onStart(mode)}
    >
      <span className="flex items-center justify-between">
        <span
          className={`${focus ? 'theme-cyan bg-cyan-300/12' : 'theme-rose bg-rose-300/10'} grid size-9 place-items-center rounded-xl`}
        >
          {icon}
        </span>
        <span
          className={`${focus ? 'theme-cyan bg-cyan-300/12' : 'theme-rose opacity-70'} rounded-full px-2 py-1 text-[9px] uppercase tracking-[.16em]`}
        >
          {badge}
        </span>
      </span>
      <strong className="mt-4 block text-lg">{title}</strong>
      <span className="theme-muted mt-1 block text-xs leading-5">
        {description}
      </span>
    </button>
  );
}

export function StatusOverlay({
  snapshot,
  onRestart,
  onTogglePause,
}: {
  readonly snapshot: GameSnapshot;
  readonly onRestart: () => void;
  readonly onTogglePause: () => void;
}) {
  const primaryAction = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const isVisible =
    snapshot.status === 'paused' || snapshot.status === 'game-over';
  useEffect(() => {
    const currentDialog = dialog.current;
    if (!isVisible || !currentDialog) return;
    currentDialog.showModal();
    primaryAction.current?.focus();
    return () => currentDialog.close();
  }, [isVisible]);
  if (!isVisible) return null;
  const isGameOver = snapshot.status === 'game-over';
  const action = isGameOver ? onRestart : onTogglePause;
  return (
    <div className="game-overlay absolute inset-0 z-40 grid place-items-center p-6 backdrop-blur-md">
      <dialog
        ref={dialog}
        className="game-dialog game-modal m-auto max-h-[calc(100dvh-6rem)] w-full max-w-sm overflow-y-auto rounded-3xl border p-7 text-center text-inherit shadow-[0_28px_90px_rgba(0,0,0,.3)]"
        aria-modal="true"
        aria-labelledby="status-title"
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !isGameOver) action();
        }}
      >
        <p className="theme-cyan text-xs uppercase tracking-[.22em]">
          {isGameOver ? 'Куб заполнен' : 'Пауза'}
        </p>
        <h2 id="status-title" className="mt-3 text-2xl font-semibold">
          {isGameOver ? 'Партия завершена' : 'Остановили время'}
        </h2>
        <p className="theme-muted mt-2 text-sm leading-6">
          Счёт: {snapshot.score.toLocaleString('ru-RU')}
        </p>
        <Button ref={primaryAction} className="mt-6 w-full" onClick={action}>
          {isGameOver ? (
            <>
              <RotateCcw /> Новая игра
            </>
          ) : (
            <>
              <Play /> Продолжить
            </>
          )}
        </Button>
      </dialog>
    </div>
  );
}
