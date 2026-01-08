import { useEffect, useRef, useState } from 'react';
import { useCommunication as useCommData } from '../context/CommunicationContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useSpeech, useVibration } from '../hooks/useSensors';
import Emoji from './Emoji';

const UniversalCommWindow = () => {
  const { status, peer, messages, isGlitching, startMatching, disconnect, sendMessage } = useCommData();
  const { isVisuallyImpaired, isDeaf, isMute } = useAccessibility();
  const { speak } = useSpeech();
  const { vibrateShort, vibratePattern } = useVibration();
  const lastMessageId = useRef<string | null>(null);
  const [visualPulse, setVisualPulse] = useState(false);
  const [translationLog, setTranslationLog] = useState<string | null>(null);

  const isBlindDeaf = isVisuallyImpaired && isDeaf;

  useEffect(() => {
    if (status === 'connected') {
      if (isBlindDeaf) {
        // TACTILE MASTERY: Success Pattern
        vibratePattern([50, 100, 50, 100, 500]);
      } else {
        vibratePattern([500, 100, 500]);
      }
      speak("Universal Link Established");
    }
  }, [status, vibratePattern, speak, isBlindDeaf]);

  useEffect(() => {
    if (status === 'connected' && messages.length > 0) {
      const latest = messages[messages.length - 1];
      if (latest.sender === 'peer' && latest.id !== lastMessageId.current) {
        lastMessageId.current = latest.id;
        
        const translations: string[] = [];
        
        if (isVisuallyImpaired) {
          speak(latest.type === 'emoji' ? `Peer sent an emoji.` : latest.payload);
          translations.push('Audio Path Active');
        }
        
        if (isDeaf) {
          if (isBlindDeaf) {
            // TACTILE MASTERY: Message Pattern
            vibratePattern([50, 50, 50]);
          } else {
            vibrateShort();
          }
          setVisualPulse(true);
          setTimeout(() => setVisualPulse(false), 1000);
          translations.push('Visual Pulse Sync');
        }

        if (translations.length > 0) {
          setTranslationLog(`${latest.type.toUpperCase()} → ${translations.join(' + ')}`);
          setTimeout(() => setTranslationLog(null), 3000);
        }
      }
    }
  }, [messages, status, isVisuallyImpaired, isDeaf, speak, vibrateShort, vibratePattern, isBlindDeaf]);

  return (
    <div className="relative mb-12">
      <div className="absolute inset-0 bg-neo-black translate-x-4 translate-y-4"></div>
      <div className={`
        relative neo-border bg-neo-white min-h-[450px] flex flex-col overflow-hidden transition-all duration-300
        ${visualPulse ? 'border-neo-main border-[10px] scale-[1.01]' : ''}
        ${isGlitching ? 'animate-glitch' : ''}
      `}>
        {/* Translation Alert Overlay */}
        {translationLog && (
          <div className="absolute top-16 left-0 w-full z-50 flex justify-center pointer-events-none">
            <div className="bg-neo-black text-neo-accent px-4 py-2 font-heavy text-xs uppercase italic animate-in fade-in slide-in-from-top-4 duration-300">
               TRANSLATION: {translationLog}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-neo-black text-neo-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${status === 'connected' ? 'bg-neo-accent animate-pulse' : status === 'searching' ? 'bg-neo-blue animate-ping' : 'bg-gray-500'}`}></div>
            <h2 className="font-heavy uppercase tracking-widest text-xl">
              {status === 'idle' && 'Universal Communication Hub'}
              {status === 'searching' && 'Seeking Connection...'}
              {status === 'connected' && 'Session: Live Link Established'}
            </h2>
          </div>
          {status === 'connected' && (
            <button 
              onClick={disconnect}
              className="bg-neo-main text-neo-white px-4 py-1 font-heavy uppercase text-sm hover:translate-y-[-2px] transition-transform"
            >
              Terminate
            </button>
          )}
        </div>

        {/* Interior */}
        <div className="flex-1 flex flex-col p-6 bg-[radial-gradient(#0f0f0f_1px,transparent_1px)] [background-size:30px_30px] bg-opacity-5">
          {status === 'idle' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-8">
              <div className="text-8xl animate-bounce">
                <Emoji char="🌐" />
              </div>
              <button 
                onClick={startMatching}
                className="neo-border bg-neo-accent px-12 py-6 font-heavy text-3xl uppercase italic hover:bg-neo-main hover:text-neo-white transition-all transform hover:-translate-y-2 shadow-neo-lg active:translate-y-1 active:translate-x-1"
              >
                Find Resonance →
              </button>
              <p className="font-body text-xl max-w-md text-center">
                Connect with a random peer. Your sensory barriers will be translated into a shared experience.
              </p>
            </div>
          )}

          {status === 'searching' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-12">
              <div className="relative">
                <div className="w-32 h-32 border-8 border-neo-black rounded-full border-t-neo-accent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                  <Emoji char="📡" />
                </div>
              </div>
              <p className="font-heavy text-4xl uppercase italic animate-pulse">Scanning Waves...</p>
            </div>
          )}

          {status === 'connected' && peer && (
            <div className="flex-1 flex flex-col">
              {/* Peer Info Strip */}
              <div className="flex gap-4 mb-6 pb-4 border-b-2 border-neo-black">
                <span className="font-heavy uppercase text-sm opacity-50">Peer Profile:</span>
                <div className="flex gap-2">
                  {peer.impairments.map(imp => (
                    <span key={imp} className="bg-neo-black text-neo-white px-2 py-0.5 text-xs font-heavy uppercase tracking-tighter">
                      {imp === 'visual' && 'Blind'}
                      {imp === 'deaf' && 'Deaf'}
                      {imp === 'mute' && 'Mute'}
                    </span>
                  ))}
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[250px] mb-6 p-2 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center opacity-30 italic">
                    Connection stable. Send a signal.
                  </div>
                ) : (
                  messages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`
                        max-w-[80%] p-4 neo-border font-heavy text-xl
                        ${msg.sender === 'me' ? 'bg-neo-accent text-neo-black' : 'bg-neo-black text-neo-white'}
                        ${msg.sender === 'peer' && isDeaf && visualPulse ? 'animate-bounce' : ''}
                      `}>
                        {msg.type === 'emoji' ? <Emoji char={msg.payload} /> : msg.payload}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Area */}
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <input 
                    type="text"
                    placeholder={isMute ? "Mute Mode: Use Signal Wheel..." : isVisuallyImpaired ? "Voice Command Active..." : "Enter signal..."}
                    disabled={isMute}
                    className="flex-1 neo-border p-4 font-heavy focus:outline-none focus:ring-4 ring-neo-accent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        sendMessage('text', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  {isVisuallyImpaired && (
                    <button 
                      onClick={() => sendMessage('text', 'Vibe check! (Voice Signal)')}
                      className="neo-border bg-neo-blue text-neo-white px-6 font-heavy uppercase animate-pulse hover:bg-neo-main transition-colors"
                    >
                      VOICE
                    </button>
                  )}
                  <div className="flex gap-2">
                    {['❤️', '🔥', '👏', '👋'].map(e => (
                      <button 
                        key={e}
                        onClick={() => sendMessage('emoji', e)}
                        className="neo-border bg-neo-white p-3 hover:bg-neo-accent transition-colors"
                      >
                        <Emoji char={e} />
                      </button>
                    ))}
                  </div>
                </div>
                {isMute && (
                  <div className="flex justify-center gap-4 py-2 border-t-2 border-neo-black bg-neo-accent bg-opacity-10">
                    <span className="font-heavy uppercase text-xs self-center">Gesture Shortcuts:</span>
                    {['🙏', '🤝', '✌️', '💪'].map(e => (
                      <button key={e} onClick={() => sendMessage('emoji', e)} className="text-3xl hover:scale-125 transition-transform"><Emoji char={e} /></button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Resilience Footer Marquee */}
        <div className="bg-neo-black py-2 overflow-hidden border-t-2 border-neo-black flex whitespace-nowrap">
           <div className="flex animate-marquee shrink-0 gap-8 items-center px-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 text-[10px] font-heavy text-neo-accent uppercase italic">
                   <span>Resilience Link: STABLE</span>
                   <div className="flex gap-1 h-3 items-end">
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className={`w-1 bg-neo-accent ${j < 4 ? 'h-full' : 'h-1/2 opacity-30'}`}></div>
                      ))}
                   </div>
                   <span className="text-neo-blue">SYNC_MODE: ACTIVE</span>
                   <span className="opacity-30">|</span>
                </div>
              ))}
           </div>
           <div className="flex animate-marquee shrink-0 gap-8 items-center px-4" aria-hidden="true">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 text-[10px] font-heavy text-neo-accent uppercase italic">
                   <span>Resilience Link: STABLE</span>
                   <div className="flex gap-1 h-3 items-end">
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className={`w-1 bg-neo-accent ${j < 4 ? 'h-full' : 'h-1/2 opacity-30'}`}></div>
                      ))}
                   </div>
                   <span className="text-neo-blue">SYNC_MODE: ACTIVE</span>
                   <span className="opacity-30">|</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalCommWindow;
