import React, { useEffect, useRef, useState } from 'react';
import { cameraManager } from '../features/CameraManager';
import { eventBus } from '../features/EventBus';
import Emoji from './Emoji';

const CameraPreview: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [expression, setExpression] = useState<{ label: string; emoji: string }>({ 
    label: 'NEUTRAL', 
    emoji: '😐' 
  });
  const [gesture, setGesture] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const updateStream = () => {
      const video = cameraManager.getVideoElement();
      if (videoRef.current && video.srcObject && videoRef.current.srcObject !== video.srcObject) {
        videoRef.current.srcObject = video.srcObject;
        videoRef.current.play().catch(() => {});
      }
    };

    updateStream();

    const handleCameraReady = () => {
      if (mounted) updateStream();
    };

    const handleExpression = (data: { expression: string; probability: number; timestamp: number }) => {
      const map: Record<string, string> = {
        happy: '😊', sad: '😢', angry: '😠', surprised: '😮', 
        disgusted: '🤢', fearful: '😨', neutral: '😐'
      };
      
      setExpression({
        label: data.probability === 0 ? 'NEUTRAL' : data.expression.toUpperCase(),
        emoji: data.probability === 0 ? '😐' : (map[data.expression] || '😐')
      });
    };

    const handleGesture = (data: { categoryName: string; score: number }) => {
      // Map MediaPipe names to readable text/emoji
      const map: Record<string, string> = {
        'Thumb_Up': '👍 UP',
        'Thumb_Down': '👎 DOWN',
        'Victory': '✌️ VICTORY',
        'Open_Palm': '👋 WAVE',
        'ILoveYou': '🤟 LOVE',
        'Pointing_Up': '☝️ POINT',
        'Closed_Fist': '✊ FIST'
      };
      setGesture(map[data.categoryName] || data.categoryName);
      
      // Clear gesture after a short delay
      setTimeout(() => {
        if (mounted) setGesture(null);
      }, 2000);
    };

    eventBus.on('camera_ready', handleCameraReady);
    eventBus.on('expression_detected', handleExpression);
    eventBus.on('gesture_detected', handleGesture);

    const interval = setInterval(() => {
      if (!videoRef.current?.srcObject) updateStream();
    }, 1000);

    return () => {
      mounted = false;
      eventBus.off('camera_ready', handleCameraReady);
      eventBus.off('expression_detected', handleExpression);
      eventBus.off('gesture_detected', handleGesture);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative group overflow-hidden" data-haptic-label="Live Camera Feedback">
      <div className="absolute inset-0 bg-neo-black translate-x-3 translate-y-3"></div>
      <div className="relative neo-border bg-neo-black min-h-[400px] flex flex-col">
        {/* Header */}
        <div className="bg-neo-accent p-4 border-b-4 border-neo-black flex justify-between items-center">
          <h3 className="font-heavy text-2xl uppercase italic text-neo-black">Self Sync</h3>
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-neo-black rounded-full animate-pulse"></div>
            <span className="text-sm font-heavy uppercase">Live Feed</span>
          </div>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative bg-neo-black overflow-hidden flex items-center justify-center">
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted 
            onLoadedData={(e) => e.currentTarget.play()}
            className="w-full h-full object-cover transition-all duration-500 scale-x-[-1]"
          />
          
          {/* Status Overlays */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-4">
            {gesture && (
               <div className="neo-border bg-neo-blue text-neo-white p-4 font-heavy uppercase text-2xl animate-bounce self-start transform rotate-1">
                  {gesture}
               </div>
            )}

            <div className={`neo-border bg-neo-white p-4 flex items-center gap-6 transform -rotate-1 group-hover:rotate-0 transition-transform w-full ${expression.label === 'NEUTRAL' ? 'opacity-40' : ''}`}>
              <div className="text-5xl">
                <Emoji char={expression.emoji} />
              </div>
              <div>
                <p className="text-xs font-heavy text-neo-black opacity-50 uppercase tracking-tighter">Current Mood</p>
                <p className="text-3xl font-heavy text-neo-black uppercase leading-none">
                    {expression.label === 'NEUTRAL' ? 'ACTIVE' : expression.label}
                </p>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay bg-neo-black/10"></div>
        </div>
      </div>
    </div>
  );
};

export default CameraPreview;
