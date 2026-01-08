import { useState, useEffect } from 'react';
import { useAccessibility, type ColorBlindType } from '../context/AccessibilityContext';
import { useSound, useSpeech } from '../hooks/useSensors';

const Header = () => {
  const [isEnglish, setIsEnglish] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const { colorBlindMode, setColorBlindMode, ttsSettings, setTTSSetting } = useAccessibility();
  const { playClick, playPing, playSuccess } = useSound();
  const { speak } = useSpeech();

  useEffect(() => {
    const interval = setInterval(() => {
      setIsEnglish((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full flex justify-between items-center px-4 md:px-12 py-3 md:py-4 z-[100] bg-neo-accent border-b-4 border-neo-black">
        <div 
          className="group cursor-pointer relative h-10 w-64 flex items-center overflow-hidden"
          onClick={() => window.location.reload()}
        >
          <div 
            className={`absolute w-full transition-all duration-700 ease-in-out transform ${
              isEnglish ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'
            }`}
          >
            <h1 className="text-3xl font-heavy uppercase tracking-tighter text-neo-black hover:text-neo-main transition-colors">
              OnuVuti.
            </h1>
          </div>
          <div 
            className={`absolute w-full transition-all duration-700 ease-in-out transform ${
              !isEnglish ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
          >
            <h1 className="text-3xl font-bangla font-bold uppercase tracking-tighter text-neo-black hover:text-neo-main transition-colors">
              অনুভূতি
            </h1>
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => {
              playClick();
              setShowSettings(true);
            }}
            className="neo-border bg-neo-white !p-2 cursor-pointer text-xl hover:bg-neo-main transition-all shadow-neo-sm"
          >
            ⚙️
          </button>
          <button 
             onClick={() => {
               playClick();
               speak("Menu not implemented", { rate: 1.5 });
             }}
             className="md:hidden neo-border bg-neo-white !p-2 cursor-pointer text-xl"
          >
            ☰
          </button>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-neo-black/80 backdrop-blur-sm" onClick={() => setShowSettings(false)}></div>
             <div className="relative neo-border bg-neo-white w-full max-w-xl p-8 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-8 border-b-4 border-neo-black pb-4">
                  <h2 className="font-heavy text-4xl uppercase italic">Interface Deck</h2>
                  <button onClick={() => setShowSettings(false)} className="text-4xl hover:rotate-90 transition-transform">✕</button>
                </div>

                <div className="space-y-8">
                   {/* Color Blind Section */}
                   <section>
                      <h3 className="font-heavy text-xs opacity-50 uppercase mb-4 tracking-widest">Chromatic Correction</h3>
                      <div className="grid grid-cols-2 gap-4">
                         {(['none', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'] as ColorBlindType[]).map(mode => (
                           <button 
                             key={mode}
                             onClick={() => {
                               setColorBlindMode(mode);
                               playPing();
                               speak(`${mode === 'none' ? 'Normal' : mode} mode active`);
                             }}
                             className={`neo-border p-3 font-heavy uppercase text-xs transition-all ${colorBlindMode === mode ? 'bg-neo-black text-neo-white scale-95' : 'bg-neo-white hover:bg-neo-accent'}`}
                           >
                             {mode === 'none' ? 'Standard (Full)' : mode}
                           </button>
                         ))}
                      </div>
                   </section>

                   {/* TTS Section */}
                   <section>
                      <h3 className="font-heavy text-xs opacity-50 uppercase mb-4 tracking-widest">Neural Voice Tuning</h3>
                      <div className="space-y-6 bg-neo-accent/10 p-4 neo-border border-dashed">
                         <div className="space-y-2">
                            <div className="flex justify-between font-heavy text-xs uppercase">
                               <span>Pace (Speed)</span>
                               <span>{ttsSettings.rate.toFixed(1)}x</span>
                            </div>
                            <input 
                              type="range" min="0.5" max="2" step="0.1" 
                              value={ttsSettings.rate}
                              onChange={(e) => setTTSSetting('rate', parseFloat(e.target.value))}
                              className="w-full h-4 bg-neo-black appearance-none cursor-pointer"
                            />
                         </div>
                         <div className="space-y-2">
                            <div className="flex justify-between font-heavy text-xs uppercase">
                               <span>Resonance (Pitch)</span>
                               <span>{ttsSettings.pitch.toFixed(1)}</span>
                            </div>
                            <input 
                              type="range" min="0.5" max="2" step="0.1" 
                              value={ttsSettings.pitch}
                              onChange={(e) => setTTSSetting('pitch', parseFloat(e.target.value))}
                              className="w-full h-4 bg-neo-black appearance-none cursor-pointer"
                            />
                         </div>
                      </div>
                   </section>

                   <button 
                     onClick={() => {
                       playSuccess();
                       speak("Settings Synchronized", { rate: ttsSettings.rate, pitch: ttsSettings.pitch });
                       setShowSettings(false);
                     }}
                     className="w-full neo-button !bg-neo-purple !text-neo-white animate-pulse"
                   >
                     Apply Configurations →
                   </button>
                </div>
             </div>
          </div>
        )}
    </header>
  );
};

export default Header;
