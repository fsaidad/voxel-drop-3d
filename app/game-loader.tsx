'use client';

import { I18nProvider } from '@/src/shared/i18n';
import { GameErrorBoundary } from '@/src/shared/ui';
import { GamePreview } from '@/src/widgets/game-scene';

export function GameLoader() {
  return (
    <I18nProvider>
      <GameErrorBoundary>
        <GamePreview />
      </GameErrorBoundary>
    </I18nProvider>
  );
}
