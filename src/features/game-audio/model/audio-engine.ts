type Cue = 'start' | 'lock' | 'clear' | 'game-over';

const CUE_NOTES: Record<Cue, readonly [frequency: number, offset: number][]> = {
  start: [
    [220, 0],
    [330, 0.07],
  ],
  lock: [
    [105, 0],
    [72, 0.045],
  ],
  clear: [
    [330, 0],
    [440, 0.07],
    [660, 0.14],
  ],
  'game-over': [
    [180, 0],
    [135, 0.1],
    [90, 0.2],
  ],
};

class GameAudioEngine {
  private context: AudioContext | null = null;

  unlock(): void {
    const context = this.getContext();
    if (context?.state === 'suspended') void context.resume();
  }

  play(cue: Cue): void {
    const context = this.getContext();
    if (!context || context.state !== 'running') return;
    const now = context.currentTime;
    const notes = CUE_NOTES[cue];
    notes.forEach(([frequency, offset], index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = now + offset;
      const duration =
        cue === 'game-over' ? 0.19 : cue === 'clear' ? 0.13 : 0.08;
      oscillator.type = cue === 'lock' ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(frequency, start);
      if (cue === 'lock')
        oscillator.frequency.exponentialRampToValueAtTime(
          Math.max(45, frequency * 0.7),
          start + duration,
        );
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(
        cue === 'clear' ? 0.055 : 0.04,
        start + 0.012,
      );
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + index * 0.005);
    });
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    this.context ??= new AudioContext({ latencyHint: 'interactive' });
    return this.context;
  }
}

export const gameAudio = new GameAudioEngine();
