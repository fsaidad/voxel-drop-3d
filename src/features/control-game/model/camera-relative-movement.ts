export type MoveIntent = 'forward' | 'backward' | 'left' | 'right';

export interface GridDirection {
  readonly dx: -1 | 0 | 1;
  readonly dz: -1 | 0 | 1;
}

export interface MovementBasis {
  readonly forward: GridDirection;
  readonly right: GridDirection;
}

export function getSnappedMovementBasis(cameraX: number, cameraZ: number): MovementBasis {
  const forwardX = -cameraX;
  const forwardZ = -cameraZ;

  const forward: GridDirection = Math.abs(forwardX) > Math.abs(forwardZ)
    ? { dx: forwardX >= 0 ? 1 : -1, dz: 0 }
    : { dx: 0, dz: forwardZ >= 0 ? 1 : -1 };

  return {
    forward,
    right: { dx: -forward.dz as -1 | 0 | 1, dz: forward.dx },
  };
}

export function directionForIntent(intent: MoveIntent, basis: MovementBasis): GridDirection {
  if (intent === 'forward') return basis.forward;
  if (intent === 'backward') return { dx: -basis.forward.dx as -1 | 0 | 1, dz: -basis.forward.dz as -1 | 0 | 1 };
  if (intent === 'right') return basis.right;
  return { dx: -basis.right.dx as -1 | 0 | 1, dz: -basis.right.dz as -1 | 0 | 1 };
}
