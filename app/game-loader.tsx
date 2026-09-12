'use client';

import { GameErrorBoundary } from '@/src/shared/ui';
import { GamePreview } from '@/src/widgets/game-scene';

export function GameLoader() {
  return (
    <GameErrorBoundary>
      <GamePreview />
    </GameErrorBoundary>
  );
}
