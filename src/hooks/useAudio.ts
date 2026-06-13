import { useCallback, useRef } from 'react';
import { useConfig } from '../config';

type SoundEffect = 'success' | 'error' | 'complete';

const soundPaths: Record<SoundEffect, string> = {
  success: '/audio/sfx/success.mp3',
  error: '/audio/sfx/error.mp3',
  complete: '/audio/sfx/complete.mp3',
};

/**
 * Hook for playing sound effects.
 * Respects the audio feature flag from config.
 */
export function useAudio() {
  const { config } = useConfig();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isEnabled = config.features.audio.enabled && config.features.audio.sfx;

  const play = useCallback(
    async (sound: SoundEffect) => {
      if (!isEnabled) {
        return;
      }

      try {
        // Stop any currently playing sound
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        // Create new audio element
        const audio = new Audio(soundPaths[sound]);
        audioRef.current = audio;
        audio.volume = 0.5;

        await audio.play();
      } catch (error) {
        // Audio play failed - likely user hasn't interacted yet or file missing
        // This is expected in some cases, so we silently ignore
        console.debug('Audio play failed:', error);
      }
    },
    [isEnabled]
  );

  const playSuccess = useCallback(() => play('success'), [play]);
  const playError = useCallback(() => play('error'), [play]);
  const playComplete = useCallback(() => play('complete'), [play]);

  return {
    play,
    playSuccess,
    playError,
    playComplete,
    isEnabled,
  };
}
