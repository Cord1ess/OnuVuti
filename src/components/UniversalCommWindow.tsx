import React, { useEffect, useRef, useState } from 'react';
import { useCommunication as useCommData } from '../context/CommunicationContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useSpeech, useVibration, useSound } from '../hooks/useSensors';
import Emoji from './Emoji';

const UniversalCommWindow = () => {
    const { status, peer, messages, isGlitching, startMatching, disconnect, sendMessage } = useCommData();
    const { isVisuallyImpaired, isDeaf, isMute } = useAccessibility();
    const { speak } = useSpeech();
    const { vibrateShort, vibratePattern } = useVibration();
    const { playClick, playSuccess, playPing, playFrequency } = useSound();
    const lastMessageId = useRef<string | null>(null);
    const [visualPulse, setVisualPulse] = useState(false);
    const [translationLog, setTranslationLog] = useState<string | null>(null);
    const feedRef = useRef<HTMLDivElement>(null);

  const isBlindDeaf = isVisuallyImpaired && isDeaf;

  // Auto-scroll to bottom
  useEffect(() => {
    if (feedRef.current) {
        feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (status === 'connected') {
      if (isBlindDeaf) {
         vibratePattern([50, 100, 50, 100, 500]);
      } else {
         playSuccess();
         speak("Resonance Established");
      }
    }
  }, [status, vibratePattern, speak, playSuccess, isBlindDeaf]);

  useEffect(() => {
    if (status === 'connected' && messages.length > 0) {
      const latest = messages[messages.length - 1];
      if (latest.sender === 'peer' && latest.id !== lastMessageId.current) {
        lastMessageId.current = latest.id;
        
        const translations: string[] = [];
        
        if (isVisuallyImpaired) {
          const content = latest.type === 'emoji' ? `Peer sent ${latest.payload} emoji.` : 
                         latest.type === 'gif' ? "Visual signal received." :
                         latest.payload;
          speak(content);
          translations.push('Audio Path Active');
        } else {
          const content = latest.type === 'emoji' ? `Peer sent ${latest.payload} emoji.` : 
                         latest.type === 'gif' ? "Visual Signal" :
                         latest.payload;
          speak(content);
          playPing();
        }
        
        if (isDeaf) {
          isBlindDeaf ? vibratePattern([50, 50, 50]) : vibrateShort();
          setVisualPulse(true);
          setTimeout(() => setVisualPulse(false), 1000);
          translations.push('Tactile Pulse');
        }

        if (translations.length > 0) {
          setTranslationLog(`${translations.join(' + ')} activated`);
          setTimeout(() => setTranslationLog(null), 3000);
        }
      }
    }
  }, [messages, status, isVisuallyImpaired, isDeaf, speak, vibrateShort, vibratePattern, isBlindDeaf]);

  return (
    <div className="relative mb-12">
      <div className="absolute inset-0 bg-neo-black translate-x-4 translate-y-4"></div>
      <div className={`
        relative neo-border bg-neo-white min-h-[550px] flex flex-col overflow-hidden transition-all duration-300
        ${visualPulse ? 'border-neo-main border-[10px]' : ''}
        ${isGlitching ? 'animate-glitch' : ''}
      `}>
        {/* Connection Tooltip */}
        {translationLog && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-neo-black text-neo-accent px-4 py-1 font-heavy text-[10px] uppercase italic animate-pulse">
               {translationLog}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-neo-black text-neo-white px-6 py-4 flex justify-between items-center z-30">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${status === 'connected' ? 'bg-neo-accent animate-pulse' : status === 'searching' ? 'bg-neo-blue animate-ping' : status === 'error' ? 'bg-red-500' : 'bg-gray-500'}`}></div>
            <h2 className="font-heavy uppercase tracking-widest text-xl">
              {status === 'idle' && 'Universal Link'}
              {status === 'searching' && 'Calibrating Waves...'}
              {status === 'connected' && 'Session: Live Resonance'}
              {status === 'error' && 'Link Error: Check Server'}
            </h2>
          </div>
          {status === 'connected' && (
            <button 
              onClick={() => { playClick(); disconnect(); }}
              className="bg-neo-main text-neo-white px-4 py-1 font-heavy uppercase text-sm hover:translate-y-[-2px] transition-transform"
            >
              Sever
            </button>
          )}
        </div>

        {/* Interior */}
        <div className="flex-1 flex flex-col p-6 bg-[radial-gradient(#0f0f0f_1px,transparent_1px)] [background-size:30px_30px] bg-opacity-5">
          {status === 'idle' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-8">
              <div className="text-8xl animate-bounce">
                <Emoji char="📡" />
              </div>
              <button 
                onClick={() => { playClick(); startMatching(); }}
                onMouseEnter={() => playFrequency(800, 'sine', 0.05, 0.02)}
                className="neo-border bg-neo-accent px-12 py-6 font-heavy text-3xl uppercase italic hover:bg-neo-main hover:text-neo-white transition-all transform hover:-translate-y-2 shadow-neo-lg active:translate-y-1 active:translate-x-1"
              >
                Initiate Link →
              </button>
              <p className="font-body text-xl max-w-md text-center opacity-60">
                Pairing with available resonators. All barriers translated in real-time.
              </p>
            </div>
          )}

          {status === 'searching' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-12">
              <div className="relative">
                <div className="w-32 h-32 border-8 border-neo-black rounded-full border-t-neo-accent animate-spin"></div>
              </div>
              <p className="font-heavy text-4xl uppercase italic animate-pulse">Frequency Scan...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-8">
              <div className="text-8xl rotate-12">
                <Emoji char="⚠️" />
              </div>
              <p className="font-heavy text-2xl uppercase text-red-600">Resonance Breakdown</p>
              <button onClick={() => window.location.reload()} className="neo-button">Restart System</button>
            </div>
          )}

          {status === 'connected' && peer && (
            <div className="flex-1 flex flex-col h-full">
              {/* Message Feed */}
              <div 
                ref={feedRef}
                className="flex-1 flex flex-col gap-6 overflow-y-auto max-h-[380px] mb-6 p-4 custom-scrollbar bg-neo-black bg-opacity-5 neo-border-sm"
              >
                {messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center opacity-20 italic font-heavy uppercase">
                    Channel Stable.
                  </div>
                ) : (
                  messages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`
                        max-w-[85%] p-4 neo-border font-heavy text-2xl
                        ${msg.sender === 'me' ? 'bg-neo-accent text-neo-black' : 'bg-neo-white text-neo-black'}
                      `}>
                         {msg.type === 'emoji' ? <Emoji char={msg.payload} /> : 
                          msg.type === 'gif' ? <img src={msg.payload} className="w-full h-48 object-cover neo-border-sm" alt="Signal" /> :
                          msg.payload}
                      </div>
                      <span className="text-[10px] font-heavy opacity-30 mt-1 uppercase italic">
                        {msg.sender === 'me' ? 'Transmit' : 'Receive'}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {!isMute && !isVisuallyImpaired && (
                <div className="flex gap-4 mt-auto">
                    <input 
                        type="text"
                        placeholder="Project signal..."
                        className="flex-1 neo-border p-4 font-heavy focus:outline-none focus:ring-4 ring-neo-accent uppercase"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value) {
                                sendMessage('text', e.currentTarget.value);
                                e.currentTarget.value = '';
                            }
                        }}
                    />
                    <div className="flex gap-2">
                        {['❤️', '🔥', '👋'].map(e => (
                            <button key={e} onClick={() => sendMessage('emoji', e)} className="neo-border bg-neo-white px-6 hover:bg-neo-accent transition-all active:scale-95"><Emoji char={e} /></button>
                        ))}
                    </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(UniversalCommWindow);
