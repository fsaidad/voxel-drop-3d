'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  readonly children: ReactNode;
}

interface State {
  readonly hasError: boolean;
}

export class GameErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Voxel Drop failed to render', error, info.componentStack);
  }

  override render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="grid min-h-dvh place-items-center p-6">
        <section className="game-dialog max-w-md rounded-3xl border p-7 text-center shadow-2xl">
          <p className="theme-cyan text-xs uppercase tracking-[.2em]">
            Не удалось открыть 3D-сцену
          </p>
          <h1 className="mt-3 text-2xl font-semibold">Восстановим игру</h1>
          <p className="theme-muted mt-3 text-sm leading-6">
            Проверьте поддержку WebGL и перезагрузите страницу. Новая партия
            начнётся с чистого поля.
          </p>
          <button
            type="button"
            className="mt-6 h-10 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground"
            onClick={() => window.location.reload()}
          >
            Перезагрузить
          </button>
        </section>
      </main>
    );
  }
}
