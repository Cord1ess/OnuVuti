import { useEffect, useRef } from 'react';
import { useSpeech, useVibration } from './useSensors';

export const useHapticSight = (active: boolean) => {
  const { speak } = useSpeech();
  const { vibrateShort } = useVibration();
  const lastElementRef = useRef<string | null>(null);
  const throttleRef = useRef<boolean>(false);

  useEffect(() => {
    if (!active) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (throttleRef.current) return;

      const element = document.elementFromPoint(e.clientX, e.clientY);
      if (!element) return;

      const hapticLabel = element.getAttribute('data-haptic-label');
      
      if (hapticLabel && hapticLabel !== lastElementRef.current) {
        lastElementRef.current = hapticLabel;
        vibrateShort();
        speak(hapticLabel);
        
        throttleRef.current = true;
        setTimeout(() => {
          throttleRef.current = false;
        }, 1000); // 1 second cooldown per unique element
      } else if (!hapticLabel) {
        lastElementRef.current = null;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [active, speak, vibrateShort]);
};
