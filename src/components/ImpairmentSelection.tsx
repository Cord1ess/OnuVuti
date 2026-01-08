import { useAccessibility } from '../context/AccessibilityContext';
import { useVibration, useSpeech } from '../hooks/useSensors';
import confetti from 'canvas-confetti';

const ImpairmentSelection = ({ onComplete }: { onComplete: () => void }) => {
  const { toggleImpairment, selectedImpairments } = useAccessibility();
  const { vibrateShort } = useVibration();
  const { speak } = useSpeech();

  const options = [
    { id: 'visual', emoji: '🙈', label: 'No See' },
    { id: 'deaf', emoji: '🙉', label: 'No Hear' },
    { id: 'mute', emoji: '🙊', label: 'No Say' },
  ] as const;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-24">
      <div className="relative mb-20">
        <div className="absolute inset-0 bg-neo-black translate-x-3 translate-y-3"></div>
        <div className="relative neo-border bg-neo-accent px-12 py-6 rotate-[-1deg]">
          <h2 className="text-5xl md:text-7xl font-heavy text-center uppercase tracking-tighter italic text-neo-black">
            WHO ARE YOU?
          </h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-7xl">
        {options.map((option, index) => {
          const isSelected = selectedImpairments.includes(option.id);
          const bgColors = ['bg-neo-main', 'bg-neo-purple', 'bg-neo-blue'];
          const textColors = ['text-neo-white', 'text-neo-white', 'text-neo-white'];
          return (
            <button
              key={option.id}
              onClick={() => {
                toggleImpairment(option.id);
                vibrateShort();
                speak(`Selected ${option.label}`);
              }}
              className={`
                service-card relative group transition-all duration-300 transform
                ${isSelected ? 'scale-[1.05]' : 'hover:-translate-y-2'}
              `}
            >
              <div className="absolute inset-0 bg-neo-black translate-x-4 translate-y-4 transition-transform group-hover:translate-x-6 group-hover:translate-y-6"></div>
              <div className={`
                relative neo-border p-12 flex flex-col items-center justify-center gap-8 h-[400px]
                ${isSelected ? 'bg-neo-accent !text-neo-black' : bgColors[index] + ' ' + textColors[index]}
              `}>
                <span className="text-9xl drop-shadow-neo transition-transform group-hover:scale-110 animate-float">
                  {option.emoji}
                </span>
                <span className={`text-4xl font-heavy uppercase tracking-widest transition-colors ${isSelected ? 'text-neo-black' : 'text-outline-white group-hover:text-neo-white'}`}>
                  {option.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FF4D00', '#A3FF00', '#9D00FF']
          });
          setTimeout(onComplete, 500);
        }}
        disabled={selectedImpairments.length === 0}
        className={`
          mt-24 relative group
          ${selectedImpairments.length === 0 ? 'opacity-30 grayscale cursor-not-none' : ''}
        `}
      >
        <div className="absolute inset-0 bg-neo-black translate-x-4 translate-y-4 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform"></div>
        <div className="relative neo-border bg-neo-main px-20 py-10 font-heavy text-5xl text-neo-white hover:-translate-y-2 hover:-translate-x-2 transition-transform active:translate-x-2 active:translate-y-2">
          GO LIVE →
        </div>
      </button>
    </div>
  );
};

export default ImpairmentSelection;
