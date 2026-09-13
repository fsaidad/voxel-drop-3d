export const TUTORIAL_STEPS = [
  'camera',
  'move',
  'yaw',
  'tilt',
  'drop',
  'complete',
] as const;

export type TutorialStep = (typeof TUTORIAL_STEPS)[number];

export function nextTutorialStep(step: TutorialStep): TutorialStep {
  const index = TUTORIAL_STEPS.indexOf(step);
  return TUTORIAL_STEPS[Math.min(index + 1, TUTORIAL_STEPS.length - 1)]!;
}
