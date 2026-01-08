import { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useVibration, useSpeech } from '../hooks/useSensors';
<<<<<<< HEAD
import { useCommunication } from '../context/CommunicationContext';
import { useHapticSight } from '../hooks/useHapticSight';
import UniversalCommWindow from '../components/UniversalCommWindow';
import VisualHearing from '../components/VisualHearing';
import ExpressionComposer from '../components/ExpressionComposer';
=======
import { cameraManager } from './CameraManager';
import { gestureService } from './GestureService';
import { expressionService } from './ExpressionService';
import { decisionLayer } from './DecisionLayer';
import { eventBus } from './EventBus';
>>>>>>> f996840cc3056a9aad76811db70eb0dbe0614853

const SensoryHub = () => {
  const { isVisuallyImpaired, isDeaf, isMute } = useAccessibility();
  const { vibratePattern } = useVibration();
  const { speak } = useSpeech();
<<<<<<< HEAD
  const { sendMessage, energy, isGlitching } = useCommunication();

  // Activate Haptic Sight for Blind Users
  useHapticSight(isVisuallyImpaired);
=======
  const [expression, setExpression] = useState<{ label: string; emoji: string }>({ label: 'NEUTRAL', emoji: '😐' });
>>>>>>> f996840cc3056a9aad76811db70eb0dbe0614853

  const handleInteraction = (type: string) => {
    if (isVisuallyImpaired) {
      vibratePattern([100, 50, 100]);
      speak(`Received ${type}`);
    }
<<<<<<< HEAD
  };
=======
    // Other logic for deaf/mute flows could go here (e.g. visual feedback)
    console.log(`Interaction: ${type}`);
  };

  useEffect(() => {
    // Initialize services
    const initServices = async () => {
      try {
        await cameraManager.start();
        await gestureService.initialize();
        await expressionService.initialize();

        gestureService.start();
        expressionService.start();

        decisionLayer.setInteractionHandler(handleInteraction);
      } catch (e) {
        console.error("Failed to init services", e);
      }
    };

    initServices();

    // Subscribe to expressions for UI update
    const handleExpression = (data: { expression: string; probability: number }) => {
      const map: Record<string, string> = {
        happy: '😊',
        sad: '😢',
        angry: '😠',
        surprised: '😮',
        disgusted: '🤢',
        fearful: '😨',
        neutral: '😐'
      };
      setExpression({
        label: data.expression.toUpperCase(),
        emoji: map[data.expression] || '😐'
      });
    };

    eventBus.on('expression_detected', handleExpression);

    // Cleanup
    return () => {
      gestureService.stop();
      expressionService.stop();
      cameraManager.stop(); // Optional: if we want to keep camera alive between navigations, remove this
      eventBus.off('expression_detected', handleExpression);
    };
  }, []);

>>>>>>> f996840cc3056a9aad76811db70eb0dbe0614853
  return (
    <div className="flex flex-col gap-12 p-8 pt-24" data-haptic-label="Sensory Hub Dashboard">
      <UniversalCommWindow />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Interaction Feed */}
        <div className="lg:col-span-8 flex flex-col gap-12">
          <div 
            className={`relative transition-all duration-500 transform ${isDeaf ? 'rotate-[-1deg]' : ''}`}
            data-haptic-label="Primary Sensory Interaction Area"
          >
            <div className="absolute inset-0 bg-neo-black translate-x-6 translate-y-6"></div>
            <div className={`
              relative neo-border bg-neo-accent min-h-[600px] flex flex-col overflow-hidden
              ${isDeaf ? 'border-neo-blue border-[8px]' : ''}
              ${isGlitching ? 'animate-glitch' : ''}
            `}>
              <div className="absolute top-6 left-6 z-20 flex flex-col gap-4">
                {isDeaf && (
                  <div className="neo-border bg-neo-blue text-neo-white px-4 py-2 font-heavy italic uppercase tracking-wider animate-pulse flex items-center gap-2">
                    <div className="w-3 h-3 bg-neo-white rounded-full animate-ping"></div>
                    Visual Listening
                  </div>
                )}
                {isMute && (
                  <div className="neo-border bg-neo-black text-neo-accent px-4 py-2 font-heavy italic uppercase tracking-wider flex items-center gap-2">
                    🖐️ Gesture Sensing
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col items-center justify-center relative bg-[radial-gradient(#0f0f0f_1px,transparent_1px)] [background-size:20px_20px] opacity-20 absolute inset-0"></div>
<<<<<<< HEAD
              
              <div className="flex-1 flex items-center justify-center relative z-10 p-12">
                {isDeaf ? (
                  <div className="w-full" data-haptic-label="Audio Waveform Visualizer">
                     <VisualHearing active={true} energy={energy} />
                  </div>
                ) : (
                  <div className="text-[15rem] animate-float drop-shadow-neo text-neo-black">
                     {isMute ? '🖐️' : '👋'}
                  </div>
                )}
              </div>

              <div className="p-8 border-t-[4px] border-neo-black bg-neo-purple flex gap-8 overflow-x-auto relative z-20">
                 {['❤️', '🔥', '👏', '😢', '😮', '🙌'].map(emoji => (
                   <button 
                     key={emoji}
                     onClick={() => {
                        handleInteraction(emoji);
                        sendMessage('emoji', emoji);
                     }}
                     data-haptic-label={`Send ${emoji} signal`}
                     className="neo-button !p-6 text-6xl bg-neo-white hover:bg-neo-accent transition-colors border-4"
                   >
                     {emoji}
                   </button>
                 ))}
=======

              <div className="flex-1 flex items-center justify-center relative z-10">
                <div className="text-[15rem] animate-float drop-shadow-neo text-neo-black">
                  {isMute ? '🖐️' : isDeaf ? '✨' : '👋'}
                </div>
              </div>

              <div className="p-8 border-t-[4px] border-neo-black bg-neo-purple flex gap-8 overflow-x-auto relative z-20">
                {['❤️', '🔥', '👏', '😢', '😮', '🙌'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleInteraction(emoji)}
                    className="neo-button !p-6 text-6xl bg-neo-white hover:bg-neo-accent transition-colors border-4"
                  >
                    {emoji}
                  </button>
                ))}
>>>>>>> f996840cc3056a9aad76811db70eb0dbe0614853
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
<<<<<<< HEAD
             <div className="relative group overflow-hidden" data-haptic-label="Mood Interpretation Card">
                <div className="absolute inset-0 bg-neo-black translate-x-4 translate-y-4"></div>
                <div className="relative neo-border bg-neo-main p-8 h-full">
                  <h3 className="font-heavy text-4xl uppercase mb-6 text-neo-accent italic">Interpretation</h3>
                  <div className="bg-neo-accent neo-border p-8 flex flex-col items-center justify-center transition-transform group-hover:rotate-2">
                     <span className="text-8xl mb-4">😊</span>
                     <span className="text-3xl font-heavy uppercase tracking-widest text-neo-black">JOLLY</span>
                  </div>
                </div>
             </div>
             <div className="relative group overflow-hidden" data-haptic-label="Action Detection Card">
                <div className="absolute inset-0 bg-neo-black translate-x-4 translate-y-4"></div>
                <div className="relative neo-border bg-neo-blue p-8 h-full">
                  <h3 className="font-heavy text-4xl uppercase mb-6 text-neo-white italic">Action</h3>
                  <div className="bg-neo-purple neo-border p-8 flex flex-col items-center justify-center transition-transform group-hover:-rotate-2">
                     <span className="text-8xl mb-4">👋</span>
                     <span className="text-3xl font-heavy uppercase tracking-widest text-neo-white">WAVE</span>
                  </div>
=======
            <div className="relative group overflow-hidden">
              <div className="absolute inset-0 bg-neo-black translate-x-4 translate-y-4"></div>
              <div className="relative neo-border bg-neo-main p-8 h-full">
                <h3 className="font-heavy text-4xl uppercase mb-6 text-neo-accent italic">Interpretation</h3>
                <div className="bg-neo-accent neo-border p-8 flex flex-col items-center justify-center transition-transform group-hover:rotate-2">
                  <span className="text-8xl mb-4">{expression.emoji}</span>
                  <span className="text-3xl font-heavy uppercase tracking-widest text-neo-black">{expression.label}</span>
                </div>
              </div>
            </div>
            <div className="relative group overflow-hidden">
              <div className="absolute inset-0 bg-neo-black translate-x-4 translate-y-4"></div>
              <div className="relative neo-border bg-neo-blue p-8 h-full">
                <h3 className="font-heavy text-4xl uppercase mb-6 text-neo-white italic">Action</h3>
                <div className="bg-neo-purple neo-border p-8 flex flex-col items-center justify-center transition-transform group-hover:-rotate-2">
                  <span className="text-8xl mb-4">👋</span>
                  <span className="text-3xl font-heavy uppercase tracking-widest text-neo-white">WAVE</span>
>>>>>>> f996840cc3056a9aad76811db70eb0dbe0614853
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Control Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-12">
          {isMute && (
            <div data-haptic-label="Expression Composer Tool">
               <ExpressionComposer onSend={(msg) => sendMessage('text', msg)} />
            </div>
          )}

          <div className="relative" data-haptic-label="Active Sensory Profile">
            <div className="absolute inset-0 bg-neo-black translate-x-3 translate-y-3"></div>
            <div className="relative neo-border bg-neo-main text-neo-white p-8">
              <h2 className="font-heavy text-5xl uppercase mb-8 leading-none italic text-neo-white">SENSORY<br />INTERFACE</h2>
              <div className="flex flex-wrap gap-4">
                {isVisuallyImpaired && <span className="p-3 bg-neo-black text-neo-accent neo-border font-heavy uppercase tracking-tighter">🙈 NO SEE</span>}
                {isDeaf && <span className="p-3 bg-neo-black text-neo-blue neo-border font-heavy uppercase tracking-tighter">🙉 NO HEAR</span>}
                {isMute && <span className="p-3 bg-neo-black text-neo-accent neo-border font-heavy uppercase tracking-tighter">🙊 NO SAY</span>}
              </div>
            </div>
          </div>

          <div className="relative" data-haptic-label="Primary Control Panel">
            <div className="absolute inset-0 bg-neo-black translate-x-3 translate-y-3"></div>
            <div className="relative neo-border bg-neo-accent p-8 space-y-6">
<<<<<<< HEAD
               <h3 className="text-3xl font-heavy uppercase italic border-b-4 border-neo-black pb-4 text-neo-black">CORE TOOLS</h3>
               <button 
                  className="neo-button w-full flex justify-between items-center hover:bg-neo-white hover:text-neo-black !bg-neo-black !text-neo-accent"
                  data-haptic-label="Activate Haptic Feedback Engine"
               >
                  <span>HAPTIC ENGINE</span>
                  <span className="text-3xl">📳</span>
               </button>
               <button 
                  className="neo-button w-full flex justify-between items-center hover:bg-neo-white hover:text-neo-black !bg-neo-blue"
                  data-haptic-label="Activate Voice Synthesis Engine"
               >
                  <span>VOICE SYNTH</span>
                  <span className="text-3xl">🎙️</span>
               </button>
               <button 
                  className="neo-button w-full flex justify-between items-center hover:bg-neo-white hover:text-neo-black !bg-neo-purple"
                  data-haptic-label="Activate System Glitch Mode"
               >
                  <span>GLITCH MODE</span>
                  <span className="text-3xl">🌓</span>
               </button>
=======
              <h3 className="text-3xl font-heavy uppercase italic border-b-4 border-neo-black pb-4 text-neo-black">CORE TOOLS</h3>
              <button className="neo-button w-full flex justify-between items-center hover:bg-neo-white hover:text-neo-black !bg-neo-black !text-neo-accent">
                <span>HAPTIC ENGINE</span>
                <span className="text-3xl">📳</span>
              </button>
              <button className="neo-button w-full flex justify-between items-center hover:bg-neo-white hover:text-neo-black !bg-neo-blue">
                <span>VOICE SYNTH</span>
                <span className="text-3xl">🎙️</span>
              </button>
              <button className="neo-button w-full flex justify-between items-center hover:bg-neo-white hover:text-neo-black !bg-neo-purple">
                <span>GLITCH MODE</span>
                <span className="text-3xl">🌓</span>
              </button>
>>>>>>> f996840cc3056a9aad76811db70eb0dbe0614853
            </div>
          </div>

          <div className="relative clip-corner" data-haptic-label="Branding Footer">
            <div className="absolute inset-0 bg-neo-black translate-x-3 translate-y-3"></div>
            <div className="relative neo-border bg-neo-black text-neo-white p-12 overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-full bg-neo-accent opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <div className="text-7xl font-heavy italic text-outline-white animate-pulse text-center">অনুভূতি</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensoryHub;
