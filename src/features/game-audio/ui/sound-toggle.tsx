'use client';
import { useI18n } from '@/src/shared/i18n';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { gameAudio } from '../model/audio-engine';
import { useAudioSettings } from '../model/audio-store';
export function SoundToggle() {
  const { t } = useI18n();
  const enabled = useAudioSettings((state) => state.enabled);
  const toggle = useAudioSettings((state) => state.toggle);
  return (
    <Button
      variant="outline"
      size="icon"
      className="game-stat"
      aria-label={enabled ? t('Выключить звук') : t('Включить звук')}
      aria-pressed={enabled}
      onClick={() => {
        gameAudio.unlock();
        toggle();
      }}
    >
      {enabled ? <Volume2 /> : <VolumeX />}
    </Button>
  );
}
