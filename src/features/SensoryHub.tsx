import { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useVibration, useSpeech, useSound, useSpeechToText, useBrailleVibration } from '../hooks/useSensors';
import { useCommunication } from '../context/CommunicationContext';
import { useHapticSight } from '../hooks/useHapticSight';
import UniversalCommWindow from '../components/UniversalCommWindow';
import VisualHearing from '../components/VisualHearing';
import ExpressionComposer from '../components/ExpressionComposer';
import CameraPreview from '../components/CameraPreview';
import { cameraManager } from './CameraManager';
import { gestureService } from './GestureService';
import { expressionService } from './ExpressionService';
import { decisionLayer } from './DecisionLayer';
import { eventBus } from './EventBus';
import { mediatorAgent } from './MediatorAgent';

const SensoryHub = () => {
  const { isVisuallyImpaired, isDeaf, isMute } = useAccessibility();
  const { vibratePattern } = useVibration();
  const { speak } = useSpeech();
  const { playClick, playSuccess, playPing } = useSound();
  const { sendMessage, isGlitching } = useCommunication();
  const [expression, setExpression] = useState<{ label: string; emoji: string }>({ label: 'NEUTRAL', emoji: '😐' });
  const [caption, setCaption] = useState<string | null>(null);
  const [nudge, setNudge] = useState<'balance' | 'silence' | 'stabilize' | null>(null);
  const [gifSearch, setGifSearch] = useState('');
  const [showGifs, setShowGifs] = useState(false);
  const { vibrateTextAsBraille } = useBrailleVibration();

  // Voice Signal Handler (Used by Blind and Mute as alternative)
  const { startListening, isListening } = useSpeechToText((text) => {
    sendMessage('text', text);
    speak("Signal transmitted.");
  });

  // TENOR REAL SEARCH
  const [gifs, setGifs] = useState<any[]>([]);
  useEffect(() => {
    const timer = setTimeout(async () => {
        if (!gifSearch) return;
        try {
            const res = await fetch(`http://localhost:3001/api/tenor/search?q=${gifSearch}&limit=9`);
            const data = await res.json();
            setGifs(data.results || []);
        } catch (e) {
            console.error("Tenor error", e);
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [gifSearch]);

  const fetchTrending = async () => {
    try {
        const res = await fetch(`http://localhost:3001/api/tenor/trending?limit=9`);
        const data = await res.json();
        setGifs(data.results || []);
        setShowGifs(true);
    } catch (e) {}
  };

  // Activate Haptic Sight for Blind Users
  useHapticSight(isVisuallyImpaired);

  const handleInteraction = (type: string) => {
    playPing();
    vibratePattern([100, 50, 100]);
    speak(`Interaction: ${type}`);
  };

  useEffect(() => {
    // Core hardware services - Initialize ONCE
    const initServices = async () => {
      try {
        await cameraManager.start();
        await gestureService.initialize();
        await expressionService.initialize();

        gestureService.start();
        expressionService.start();

        decisionLayer.setInteractionHandler(handleInteraction);
        playSuccess();
        speak("All systems online. Resonance ready.", { rate: 0.95 });
      } catch (e) {
        console.error("Failed to init services", e);
      }
    };

    initServices();
    return () => {
      gestureService.stop();
      expressionService.stop();
      cameraManager.stop();
    };
  }, []);

  useEffect(() => {
    const handleExpression = (data: { expression: string; probability: number; timestamp: number }) => {
      const map: Record<string, string> = {
        happy: '😊', sad: '😢', angry: '😠', surprised: '😮', disgusted: '🤢', fearful: '😨', neutral: '😐'
      };
      
      setExpression(prev => {
        if (prev.label.toLowerCase() === data.expression) return prev;
        return { label: data.expression.toUpperCase(), emoji: map[data.expression] || '😐' };
      });
      
      if (data.expression !== 'neutral' && data.probability > 0.4) {
        speak(`Feeling ${data.expression}`, { rate: 1.1 });
        mediatorAgent.amplifySignal(data.expression);
      }
    };

    eventBus.on('expression_detected', handleExpression);
    return () => eventBus.off('expression_detected', handleExpression);
  }, [speak]);

  useEffect(() => {
    let timer: any;
    const handleSpeech = (text: string) => {
      setCaption(text);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setCaption(null), 4000);
    };

    if (isDeaf) eventBus.on('speech_triggered', handleSpeech);

    const handleNudge = (data: any) => {
      if (data.type === 'mediator_nudge') {
        setNudge(data.payload);
        setTimeout(() => setNudge(null), 3000);
        speak("Mediator nudge detected.", { rate: 1.2 });
      }
    };
    eventBus.on('interaction_triggered', handleNudge);

    return () => {
      eventBus.off('speech_triggered', handleSpeech);
      eventBus.off('interaction_triggered', handleNudge);
      if (timer) clearTimeout(timer);
    };
  }, [isDeaf, speak]);

  useEffect(() => {
    if (!isDeaf) return;
    const handleIncoming = (data: any) => {
        if (data.type === 'peer_signal' && data.payload.type === 'text') {
            vibrateTextAsBraille(data.payload.payload);
        }
    };
    eventBus.on('interaction_triggered', handleIncoming);
    return () => eventBus.off('interaction_triggered', handleIncoming);
  }, [isDeaf, vibrateTextAsBraille]);

  return (
    <div className="flex flex-col gap-12 p-8 pt-24" data-haptic-label="Sensory Hub Dashboard">
      <UniversalCommWindow />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Interaction Feed */}
        <div className="lg:col-span-8 flex flex-col gap-12">
          <div className={`relative transition-all duration-500 transform ${isDeaf ? 'rotate-[-1deg]' : ''}`}>
            <div className="absolute inset-0 bg-neo-black translate-x-6 translate-y-6"></div>
            <div className={`
              relative neo-border bg-neo-accent min-h-[600px] flex flex-col overflow-hidden
              ${isDeaf ? 'border-neo-blue border-[8px]' : ''}
              ${isGlitching ? 'animate-glitch' : ''}
              ${nudge ? 'after:content-[""] after:absolute after:inset-0 after:bg-neo-white after:animate-pulse after:opacity-20 after:pointer-events-none' : ''}
            `}>
              {/* Mediator Nudge Prompt */}
              {nudge && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[30] pointer-events-none w-full px-12">
                  <div className="bg-neo-black text-neo-white neo-border px-8 py-6 animate-bounce flex flex-col items-center gap-4 shadow-neo-lg border-neo-accent">
                    <span className="text-sm font-heavy tracking-widest opacity-50 uppercase">CORE SIGNAL SOURCE</span>
                    <span className="text-3xl font-heavy italic uppercase text-center leading-tight">
                      {nudge === 'silence' ? 'Resonance Fading... Send Pulse?' : 
                       nudge === 'stabilize' ? 'Emotional Turbulence. Center Yourself.' :
                       'Equilibrium Shift. Share Energy.'}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="absolute top-6 left-6 z-20 flex flex-col gap-4">
                {isDeaf && <div className="neo-border bg-neo-blue text-neo-white px-4 py-2 font-heavy italic uppercase tracking-wider animate-pulse flex items-center gap-2">
                  <div className="w-3 h-3 bg-neo-white rounded-full animate-ping"></div> Communicate Listening
                </div>}
                {isMute && <div className="neo-border bg-neo-black text-neo-accent px-4 py-2 font-heavy italic uppercase tracking-wider flex items-center gap-2">
                  🖐️ Gesture Sensing
                </div>}
              </div>

              <div className="flex-1 flex flex-col items-center justify-center relative bg-[radial-gradient(#0f0f0f_1px,transparent_1px)] [background-size:20px_20px] opacity-20 absolute inset-0"></div>
              
              <div className="flex-1 flex items-center justify-center relative z-10 p-12">
                {isDeaf ? (
                  <div className="w-full h-full flex items-center">
                     <VisualHearing active={true} />
                  </div>
                ) : (
                  <div className="text-[18rem] animate-float drop-shadow-neo text-neo-black scale-125">
                     {isMute ? '🖐️' : '👋'}
                  </div>
                )}
              </div>

              {/* Unique Role-Based Inputs */}
              <div className="p-8 border-t-[4px] border-neo-black bg-neo-purple flex flex-col gap-8 relative z-20">
                 {/* Mute: GIF & Emoji Bar */}
                 {isMute && (
                   <div className="flex flex-col gap-6">
                      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                        {['❤️', '🔥', '👏', '😢', '😮', '🙌', '🙏', '🤝', '✌️'].map(emoji => (
                          <button key={emoji} onClick={() => { playClick(); sendMessage('emoji', emoji); }} className="neo-button !p-4 bg-neo-white text-4xl hover:bg-neo-accent transition-colors">
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-4">
                        <input className="neo-border bg-neo-white p-6 flex-1 font-heavy uppercase outline-none text-xl placeholder:opacity-30" placeholder="Search GIF Signals..." value={gifSearch} onChange={(e) => setGifSearch(e.target.value)} />
                        <button className="neo-button bg-neo-accent px-12 text-xl" onClick={() => { if(!showGifs) fetchTrending(); else setShowGifs(false); }}>GIF HUB</button>
                        {/* Voice for Mute (as requested: make sure voice works in mute) */}
                        <button className={`neo-button ${isListening ? 'bg-neo-blue animate-pulse' : 'bg-neo-black text-neo-white'} px-8`} onClick={startListening}>🎤</button>
                      </div>
                      {showGifs && (
                        <div className="grid grid-cols-3 gap-6 h-80 overflow-y-auto bg-neo-black p-6 neo-border shadow-inner">
                           {gifs.map((gif: any) => (
                             <img 
                               key={gif.id} src={gif.media_formats.tinygif.url} 
                               className="cursor-pointer hover:scale-105 transition-transform w-full h-32 object-cover neo-border-sm" 
                               onClick={() => { sendMessage('gif', gif.media_formats.gif.url); setShowGifs(false); playSuccess(); }} 
                             />
                           ))}
                        </div>
                      )}
                   </div>
                 )}

                 {/* Blind: Voice Trigger */}
                 {isVisuallyImpaired && (
                   <button 
                      className={`neo-button w-full h-40 text-5xl font-heavy italic uppercase transition-all shadow-neo-lg ${isListening ? 'bg-neo-accent animate-pulse' : 'bg-neo-black text-neo-white'}`}
                      onClick={() => { speak("I am listening. Share your resonance now."); setTimeout(startListening, 2000); }}
                   >
                     {isListening ? 'Receiving Signal...' : '🎤 Project Voice Signal'}
                   </button>
                 )}

                 {/* Deaf: High Contrast Status */}
                 {isDeaf && (
                   <div className="bg-neo-blue p-8 neo-border text-neo-white font-heavy uppercase italic animate-pulse text-center text-2xl shadow-neo-lg">
                      Tactile Braille Engine: Synchronized
                   </div>
                 )}
              </div>
            </div>
          </div>

          {!isVisuallyImpaired && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="relative group overflow-hidden">
                <div className="absolute inset-0 bg-neo-black translate-x-4 translate-y-4"></div>
                <div className="relative neo-border bg-neo-main p-8 h-full">
                  <h3 className="font-heavy text-4xl uppercase mb-6 text-neo-accent italic">Mood Context</h3>
                  <div className={`bg-neo-accent neo-border p-8 flex flex-col items-center justify-center group-hover:rotate-2 transition-transform ${expression.label === 'NEUTRAL' ? 'opacity-40 animate-pulse' : ''}`}>
                    <span className="text-9xl mb-4">{expression.emoji}</span>
                    <span className="text-3xl font-heavy uppercase tracking-widest text-neo-black">
                        {expression.label === 'NEUTRAL' ? 'Scanning...' : expression.label}
                    </span>
                  </div>
                </div>
              </div>
              <div className="relative group overflow-hidden">
                <div className="absolute inset-0 bg-neo-black translate-x-4 translate-y-4"></div>
                <div className="relative neo-border bg-neo-blue p-8 h-full">
                  <h3 className="font-heavy text-4xl uppercase mb-6 text-neo-white italic">Gesture Sync</h3>
                  <div className="bg-neo-purple neo-border p-8 flex flex-col items-center justify-center group-hover:-rotate-2 transition-transform text-neo-white">
                    <span className="text-9xl mb-4">�️</span>
                    <span className="text-3xl font-heavy uppercase tracking-widest">DETECTED</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-12">
          {!isVisuallyImpaired && <CameraPreview />}
          {isMute && <ExpressionComposer onSend={(msg) => sendMessage('text', msg)} />}

          <div className="relative">
            <div className="absolute inset-0 bg-neo-black translate-x-3 translate-y-3"></div>
            <div className="relative neo-border bg-neo-main text-neo-white p-8">
              <h2 className="font-heavy text-5xl uppercase mb-8 leading-none italic text-neo-white">SENSORY<br />PROFILE</h2>
              <div className="flex flex-wrap gap-4">
                {isVisuallyImpaired && <span className="p-4 bg-neo-black text-neo-accent neo-border font-heavy uppercase text-xl">🙈 BLIND</span>}
                {isDeaf && <span className="p-4 bg-neo-black text-neo-blue neo-border font-heavy uppercase text-xl">🙉 DEAF</span>}
                {isMute && <span className="p-4 bg-neo-black text-neo-accent neo-border font-heavy uppercase text-xl">🙊 MUTE</span>}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-neo-black translate-x-3 translate-y-3"></div>
            <div className="relative neo-border bg-neo-accent p-8 space-y-6">
               <h3 className="text-3xl font-heavy uppercase italic border-b-4 border-neo-black pb-4 text-neo-black">CONTROL</h3>
               <button className="neo-button w-full flex justify-between items-center bg-neo-black text-neo-accent" onClick={() => { speak("Haptic Engine active"); vibratePattern([100, 100]); }}>
                 <span>HAPTICS</span><span className="text-3xl">📳</span>
               </button>
               <button className="neo-button w-full flex justify-between items-center bg-neo-blue text-neo-white" onClick={() => speak("Voice active")}>
                 <span>SPEECH</span><span className="text-3xl">�️</span>
               </button>
            </div>
          </div>

          <div className="relative clip-corner">
            <div className="absolute inset-0 bg-neo-black translate-x-3 translate-y-3"></div>
            <div className="relative neo-border bg-neo-black text-neo-white p-12 overflow-hidden group">
              <div className="text-7xl font-heavy italic text-outline-white animate-pulse text-center">অনুভূতি</div>
            </div>
          </div>
        </div>
      </div>

      {isDeaf && caption && (
        <div className="fixed bottom-0 left-0 w-full z-[1000] p-8 animate-in slide-in-from-bottom-full">
           <div className="bg-neo-black text-neo-white neo-border p-8 shadow-neo-lg max-w-5xl mx-auto flex items-center justify-center gap-6 border-t-[12px] border-neo-blue">
              <div className="flex gap-2">
                 <div className="w-2 h-10 bg-neo-blue animate-pulse"></div>
                 <div className="w-2 h-10 bg-neo-accent animate-pulse delay-75"></div>
              </div>
              <p className="text-4xl font-heavy uppercase tracking-tighter italic">
                {caption}
              </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default SensoryHub;
