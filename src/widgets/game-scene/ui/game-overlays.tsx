'use client';

import { useEffect, useRef } from 'react';
import {
  Crosshair,
  Eye,
  Flame,
  GraduationCap,
  Play,
  RotateCcw,
} from 'lucide-react';
import type {
  GameFeedback as Feedback,
  GameMode,
  GameSnapshot,
} from '@/src/entities/game';
import type { TutorialStep } from '@/src/features/control-game';
import { CosmeticPicker } from '@/src/features/player-progression';
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
  onTutorial,
}: {
  readonly onStart: (mode: GameMode) => void;
  readonly onTutorial: () => void;
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
        <Button
          variant="outline"
          className="game-stat mt-3 w-full"
          onClick={onTutorial}
        >
          <GraduationCap /> Пройти короткое обучение
        </Button>
        <CosmeticPicker />
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
  resumeCountdown,
  onRestart,
  onTogglePause,
}: {
  readonly snapshot: GameSnapshot;
  readonly resumeCountdown: number | null;
  readonly onRestart: () => void;
  readonly onTogglePause: () => void;
}) {
  const primaryAction = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const currentDialog = dialog.current;
    if (snapshot.status !== 'game-over' || !currentDialog) return;
    currentDialog.showModal();
    primaryAction.current?.focus();
    return () => currentDialog.close();
  }, [snapshot.status]);

  if (snapshot.status === 'paused')
    return (
      <div className="pointer-events-none absolute inset-0 z-40 flex items-end justify-center p-4 sm:items-start sm:p-5">
        {resumeCountdown !== null && (
          <output
            className="game-dialog absolute left-1/2 top-1/2 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border font-mono text-5xl font-semibold shadow-2xl backdrop-blur-xl"
            aria-live="assertive"
            aria-label={`Продолжение через ${resumeCountdown}`}
          >
            {resumeCountdown}
          </output>
        )}
        <section
          className="game-dialog pointer-events-auto flex w-full max-w-lg items-center gap-3 rounded-2xl border p-3 pr-3 shadow-2xl backdrop-blur-xl sm:p-4"
          aria-label="Игра на паузе"
        >
          <span className="theme-cyan grid size-10 shrink-0 place-items-center rounded-xl bg-cyan-300/10">
            <Eye />
          </span>
          <div className="min-w-0 flex-1">
            <strong className="block text-sm">Режим осмотра</strong>
            <span className="theme-muted block text-xs">
              Время остановлено — куб можно вращать и приближать
            </span>
            <span className="theme-subtle mt-1 hidden font-mono text-[9px] sm:block">
              Q/E → Y · ↑/↓ → X · ←/→ → Z
            </span>
          </div>
          <Button
            aria-label={
              resumeCountdown === null ? 'Продолжить игру' : 'Отменить отсчёт'
            }
            onClick={onTogglePause}
          >
            <Play />
            <span className="hidden sm:inline">
              {resumeCountdown === null ? 'Продолжить' : 'Отмена'}
            </span>
          </Button>
        </section>
      </div>
    );

  if (snapshot.status !== 'game-over') return null;
  return (
    <div className="game-overlay absolute inset-0 z-40 grid place-items-center p-6 backdrop-blur-md">
      <dialog
        ref={dialog}
        className="game-dialog game-modal m-auto max-h-[calc(100dvh-6rem)] w-full max-w-sm overflow-y-auto rounded-3xl border p-7 text-center text-inherit shadow-[0_28px_90px_rgba(0,0,0,.3)]"
        aria-modal="true"
        aria-labelledby="status-title"
      >
        <p className="theme-cyan text-xs uppercase tracking-[.22em]">
          Куб заполнен
        </p>
        <h2 id="status-title" className="mt-3 text-2xl font-semibold">
          Партия завершена
        </h2>
        <p className="theme-muted mt-2 text-sm leading-6">
          Счёт: {snapshot.score.toLocaleString('ru-RU')}
        </p>
        <Button ref={primaryAction} className="mt-6 w-full" onClick={onRestart}>
          <RotateCcw /> Новая игра
        </Button>
      </dialog>
    </div>
  );
}

const TUTORIAL_CONTENT: Record<
  TutorialStep,
  {
    readonly title: string;
    readonly description: string;
    readonly hint: string;
  }
> = {
  camera: {
    title: 'Осмотрите пространство',
    description:
      'Потяните куб мышью или пальцем. Колесо и pinch меняют масштаб.',
    hint: 'Поверните камеру',
  },
  move: {
    title: 'Сдвиньте фигуру',
    description: 'WASD двигают фигуру относительно текущего ракурса камеры.',
    hint: 'Нажмите W, A, S или D',
  },
  yaw: {
    title: 'Поверните вокруг Y',
    description:
      'Q/E или экранные Y−/Y+ поворачивают фигуру вокруг вертикальной оси.',
    hint: 'Используйте Q/E или Y−/Y+',
  },
  tilt: {
    title: 'Наклоните фигуру',
    description:
      'Стрелки вращают вокруг X/Z. На экране используйте кнопки этих осей.',
    hint: 'Используйте стрелку или X/Z',
  },
  drop: {
    title: 'Установите фигуру',
    description:
      'Проекция показывает посадку. Space мгновенно опускает фигуру.',
    hint: 'Нажмите Space',
  },
  complete: {
    title: 'Вы готовы',
    description:
      'Собирайте полностью заполненные горизонтальные слои внутри куба.',
    hint: 'Начните настоящую игру',
  },
};

export function TutorialOverlay({
  step,
  onFinish,
}: {
  readonly step: TutorialStep;
  readonly onFinish: () => void;
}) {
  const content = TUTORIAL_CONTENT[step];
  const current = ['camera', 'move', 'yaw', 'tilt', 'drop'].indexOf(step);
  return (
    <aside className="pointer-events-none absolute inset-x-3 bottom-40 z-30 sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-80">
      <div className="game-dialog rounded-2xl border p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <span className="theme-cyan text-[9px] uppercase tracking-[.2em]">
            Обучение
          </span>
          <span className="theme-subtle font-mono text-[10px]">
            {step === 'complete' ? 'Готово' : `${current + 1}/5`}
          </span>
        </div>
        <h2 className="mt-2 text-base font-semibold">{content.title}</h2>
        <p className="theme-muted mt-1 text-xs leading-5">
          {content.description}
        </p>
        {step === 'complete' ? (
          <Button
            className="pointer-events-auto mt-3 w-full"
            onClick={onFinish}
          >
            <Play /> Начать Focus
          </Button>
        ) : (
          <p className="theme-cyan mt-3 text-[10px] font-medium uppercase tracking-[.12em]">
            {content.hint}
          </p>
        )}
      </div>
    </aside>
  );
}
