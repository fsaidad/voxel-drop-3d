import { describe, expect, it } from 'vitest';
import { getVoxelSkin, isSkinUnlocked } from './skins';

describe('voxel skins', () => {
  it('keeps reward skins locked until their achievement is earned', () => {
    expect(isSkinUnlocked(getVoxelSkin('carbon'), [])).toBe(false);
    expect(isSkinUnlocked(getVoxelSkin('carbon'), ['first-placement'])).toBe(
      true,
    );
  });
});
