'use client';

import { useEffect, useRef } from 'react';
import { Eye, GraduationCap, House, Play, RotateCcw } from 'lucide-react';
import { getAchievement } from '@/src/entities/achievement';
import type {
  GameFeedback as Feedback,
  GameMode,
  GameSnapshot,
} from '@/src/entities/game';
import type { TutorialStep } from '@/src/features/control-game';
import type { SessionSummary } from '@/src/features/player-progression';
import { Button } from '@/src/shared/ui';

export function GameFeedback({ feedback }: { readonly feedback: Feedback }) {
  const isClear = feedback.kind === 'clear';
  return (
    <>
      <div
        className={`${isClear ? 'layer-clear-flash' : 'placement-pulse'} pointer-events-none absolute inset-0`}
        aria-hidden="true"
      />
      {isClear && (
        <div
          className="layer-clear-scan pointer-events-none absolute inset-x-0 z-10 h-px"
          aria-hidden="true"
        />
      )}
      <output
        className={`game-feedback game-glass pointer-events-none absolute inset-x-0 top-16 z-20 mx-auto w-fit rounded-md border px-4 py-2 text-center font-mono text-[10px] font-medium shadow-lg ${isClear ? 'border-amber-300/40 text-amber-700 dark:text-amber-100' : 'theme-cyan'}`}
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
        className="game-dialog pointer-events-auto relative m-0 max-h-[calc(100dvh-6rem)] w-full max-w-xl overflow-y-auto overscroll-contain rounded-lg border p-5 text-inherit shadow-[0_24px_70px_rgba(0,0,0,.24)] sm:p-7"
        aria-modal="false"
        aria-labelledby="ready-title"
      >
        <div>
          <p className="theme-cyan font-mono text-[10px]">НОВАЯ ПАРТИЯ / 01</p>
          <h2
            id="ready-title"
            className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Выберите свой темп
          </h2>
          <p className="theme-muted mt-2 max-w-md text-sm leading-6">
            Сначала поверните куб и найдите удобный ракурс. Таймер начнётся
            только после выбора режима.
          </p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <ModeButton
            buttonRef={primaryAction}
            mode="focus"
            title="Focus"
            description="Спокойнее падение, три следующие фигуры и проекция точки посадки."
            onStart={onStart}
          />
          <ModeButton
            mode="hardcore"
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
        <p className="theme-subtle mt-4 text-center text-[11px]">
          WASD — движение · C — Hold · мышь — камера · Space — бросить
        </p>
      </dialog>
    </div>
  );
}

function ModeButton({
  mode,
  title,
  description,
  onStart,
  buttonRef,
}: {
  mode: GameMode;
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
      className={`group rounded-md border border-l-2 p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 ${focus ? 'border-cyan-300/30 bg-cyan-300/[.045] hover:border-cyan-200/55 focus-visible:ring-cyan-300/60' : 'border-rose-300/20 bg-rose-300/[.025] hover:border-rose-300/45 focus-visible:ring-rose-300/50'}`}
      onClick={() => onStart(mode)}
    >
      <span className="flex items-center justify-between">
        <strong className="text-lg">{title}</strong>
        <span
          className={`${focus ? 'theme-cyan' : 'theme-rose'} font-mono text-[10px]`}
        >
          {focus ? '01' : '02'} / {focus ? 'CALM' : 'FAST'}
        </span>
      </span>
      <span className="theme-muted mt-1 block text-xs leading-5">
        {description}
      </span>
      <span
        className={`${focus ? 'theme-cyan' : 'theme-rose'} mt-3 block font-mono text-[9px]`}
      >
        {focus ? 'ПРОЕКЦИЯ · ОЧЕРЕДЬ ×3' : 'БЕЗ ПРОЕКЦИИ · ОЧЕРЕДЬ ×1'}
      </span>
    </button>
  );
}

export function StatusOverlay({
  snapshot,
  resumeCountdown,
  sessionSummary,
  onRestart,
  onReturnToMenu,
  onTogglePause,
}: {
  readonly snapshot: GameSnapshot;
  readonly resumeCountdown: number | null;
  readonly sessionSummary: SessionSummary | null;
  readonly onRestart: () => void;
  readonly onReturnToMenu: () => void;
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
          className="game-dialog pointer-events-auto flex w-full max-w-lg items-center gap-3 rounded-md border p-3 pr-3 shadow-lg sm:p-4"
          aria-label="Игра на паузе"
        >
          <span className="theme-cyan shrink-0">
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
        className="game-dialog game-modal m-auto max-h-[calc(100dvh-6rem)] w-full max-w-sm overflow-y-auto rounded-lg border p-7 text-center text-inherit shadow-[0_24px_70px_rgba(0,0,0,.24)]"
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
        {sessionSummary?.isNewBest && (
          <p className="mt-3 rounded-full bg-amber-300/12 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-100">
            Новый рекорд
          </p>
        )}
        {sessionSummary && sessionSummary.unlockedAchievements.length > 0 && (
          <div className="game-stat mt-4 rounded-md border p-3 text-left">
            <p className="theme-violet text-[9px] uppercase tracking-[.16em]">
              Получено за партию
            </p>
            <div className="mt-2 grid gap-1">
              {sessionSummary.unlockedAchievements.map((id) => (
                <span key={id} className="text-xs">
                  {getAchievement(id).title}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="mt-6 grid grid-cols-2 gap-2">
          <Button ref={primaryAction} onClick={onRestart}>
            <RotateCcw /> Ещё раз
          </Button>
          <Button variant="outline" onClick={onReturnToMenu}>
            <House /> В меню
          </Button>
        </div>
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
  hold: {
    title: 'Отложите фигуру',
    description:
      'C переносит текущую фигуру в Hold. Повторно менять её можно после установки.',
    hint: 'Нажмите C или экранную кнопку Hold',
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
  const current = ['camera', 'move', 'hold', 'yaw', 'tilt', 'drop'].indexOf(
    step,
  );
  return (
    <aside className="pointer-events-none absolute inset-x-3 bottom-40 z-30 sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-80">
      <div className="game-dialog rounded-md border p-4 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <span className="theme-cyan text-[9px] uppercase tracking-[.2em]">
            Обучение
          </span>
          <span className="theme-subtle font-mono text-[10px]">
            {step === 'complete' ? 'Готово' : `${current + 1}/6`}
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
