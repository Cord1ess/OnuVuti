import { useCallback, useRef, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { eventBus } from '../features/EventBus';

export const useVibration = () => {
  const vibrateLong = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(500);
      console.log('📳 Haptic: Long');
    }
  }, []);

  const vibrateShort = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
      console.log('📳 Haptic: Short');
    }
  }, []);

  const vibratePattern = useCallback((pattern: number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
      console.log('📳 Haptic: Pattern', pattern);
    }
  }, []);

  return { vibrateLong, vibrateShort, vibratePattern };
};

export const useSpeech = () => {
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const { ttsSettings } = useAccessibility();

  useEffect(() => {
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speak = useCallback((text: string, options: { rate?: number; pitch?: number; priority?: boolean } = {}) => {
    if ('speechSynthesis' in window) {
      // INSTANT RESET: Remove all delays/queues
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Select voice based on settings or quality
      const preferredVoice = voicesRef.current.find(v => v.name === ttsSettings.voice) || 
                            voicesRef.current.find(v => (v.name.includes('Google') || v.name.includes('Neural')) && v.lang.startsWith('en')) || 
                            voicesRef.current.find(v => v.lang.startsWith('en'));

      if (preferredVoice) utterance.voice = preferredVoice;
      
      // Use dynamic settings from context
      utterance.rate = options.rate ?? ttsSettings.rate;
      utterance.pitch = options.pitch ?? ttsSettings.pitch;
      
      window.speechSynthesis.speak(utterance);
      eventBus.emit('speech_triggered', text);
      console.log('🗣️ Speech (Instant):', text);
    }
  }, [ttsSettings, voicesRef]);

  return { speak };
};

export const useSound = () => {
  const playFrequency = useCallback((freq: number, type: OscillatorType = 'sine', duration = 0.1, volume = 0.1) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio blocked or unsupported
    }
  }, []);

  const playClick = useCallback(() => playFrequency(600, 'square', 0.05, 0.05), [playFrequency]);
  const playSuccess = useCallback(() => {
    playFrequency(400, 'sine', 0.1);
    setTimeout(() => playFrequency(800, 'sine', 0.1), 100);
  }, [playFrequency]);
  const playPing = useCallback(() => playFrequency(1200, 'sine', 0.05, 0.05), [playFrequency]);
  const playError = useCallback(() => playFrequency(100, 'sawtooth', 0.3, 0.1), [playFrequency]);

  return { playClick, playSuccess, playPing, playError, playFrequency };
};
