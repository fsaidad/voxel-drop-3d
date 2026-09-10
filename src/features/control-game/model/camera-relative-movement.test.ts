import { describe, expect, it } from 'vitest';
import {
  directionForIntent,
  getSnappedMovementBasis,
} from './camera-relative-movement';

describe('camera-relative movement', () => {
  it('maps screen directions from the default front camera', () => {
    const basis = getSnappedMovementBasis(10, 12);
    expect(directionForIntent('forward', basis)).toEqual({ dx: 0, dz: -1 });
    expect(directionForIntent('right', basis)).toEqual({ dx: 1, dz: 0 });
  });

  it('rotates movement after the camera crosses a cube side', () => {
    const basis = getSnappedMovementBasis(-12, 2);
    expect(directionForIntent('forward', basis)).toEqual({ dx: 1, dz: 0 });
    expect(directionForIntent('left', basis)).toEqual({ dx: 0, dz: -1 });
  });

  it('always returns perpendicular cardinal directions', () => {
    const basis = getSnappedMovementBasis(3, -9);
    const dot =
      basis.forward.dx * basis.right.dx + basis.forward.dz * basis.right.dz;
    expect(dot).toBe(0);
  });
});
