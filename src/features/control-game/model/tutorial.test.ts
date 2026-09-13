import { describe, expect, it } from 'vitest';
import { nextTutorialStep } from './tutorial';

describe('tutorial progression', () => {
  it('follows the player interaction sequence', () => {
    expect(nextTutorialStep('camera')).toBe('move');
    expect(nextTutorialStep('move')).toBe('yaw');
    expect(nextTutorialStep('yaw')).toBe('tilt');
    expect(nextTutorialStep('tilt')).toBe('drop');
    expect(nextTutorialStep('drop')).toBe('complete');
  });

  it('stays complete after the final step', () => {
    expect(nextTutorialStep('complete')).toBe('complete');
  });
});
