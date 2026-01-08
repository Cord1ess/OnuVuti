import { useCallback } from 'react';

export const useVibration = () => {
  const vibrateLong = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(500);
      console.log('📳 Haptic: Long');
    } else {
      console.warn('Vibration API not supported');
    }
  }, []);

  const vibrateShort = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
      console.log('📳 Haptic: Short');
    } else {
      console.warn('Vibration API not supported');
    }
  }, []);

  const vibratePattern = useCallback((pattern: number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
      console.log('📳 Haptic: Pattern', pattern);
    } else {
      console.warn('Vibration API not supported');
    }
  }, []);

  return { vibrateLong, vibrateShort, vibratePattern };
};

export const useSpeech = () => {
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      console.log('🗣️ Speech:', text);
    } else {
      console.warn('SpeechSynthesis API not supported');
    }
  }, []);

  return { speak };
};


