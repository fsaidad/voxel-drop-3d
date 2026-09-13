import { beforeEach, describe, expect, it } from 'vitest';
import { useProgressionStore } from './progression-store';

describe('player progression', () => {
  beforeEach(() => {
    useProgressionStore.setState({
      metrics: {
        piecesPlaced: 0,
        layersCleared: 0,
        bestScore: 0,
        gamesPlayed: 0,
        hardcorePiecesPlaced: 0,
      },
      unlockedAchievements: [],
      selectedSkin: 'spectrum',
      lastUnlock: null,
      lastSession: null,
      sessionBestBefore: 0,
      sessionUnlocks: [],
    });
  });

  it('records a session, hardcore progress, rewards, and a new best', () => {
    useProgressionStore.getState().recordSessionStarted();
    useProgressionStore.getState().recordPlacement('hardcore', 0, 120);
    useProgressionStore.getState().recordSessionFinished(120);

    const state = useProgressionStore.getState();
    expect(state.metrics).toMatchObject({
      gamesPlayed: 1,
      piecesPlaced: 1,
      hardcorePiecesPlaced: 1,
      bestScore: 120,
    });
    expect(state.unlockedAchievements).toEqual([
      'first-placement',
      'hardcore-initiate',
    ]);
    expect(state.lastSession).toMatchObject({ score: 120, isNewBest: true });
  });

  it('does not mark a lower result as a new record', () => {
    useProgressionStore.setState((state) => ({
      metrics: { ...state.metrics, bestScore: 500 },
    }));
    useProgressionStore.getState().recordSessionStarted();
    useProgressionStore.getState().recordSessionFinished(200);

    expect(useProgressionStore.getState().lastSession).toMatchObject({
      score: 200,
      isNewBest: false,
    });
  });
});
