import { describe, expect, it } from 'vitest';
import { evaluateAchievements } from './achievements';

describe('achievement evaluation', () => {
  it('returns newly satisfied achievements only', () => {
    expect(
      evaluateAchievements(
        {
          piecesPlaced: 25,
          layersCleared: 1,
          bestScore: 500,
          gamesPlayed: 2,
          hardcorePiecesPlaced: 0,
        },
        ['first-placement'],
      ),
    ).toEqual(['first-layer', 'voxel-builder']);
  });
});
