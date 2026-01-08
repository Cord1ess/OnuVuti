import { useAccessibility } from '../context/AccessibilityContext';
import { useVibration, useSpeech } from '../hooks/useSensors';

const ImpairmentSelection = ({ onComplete }: { onComplete: () => void }) => {
  const { toggleImpairment, selectedImpairments } = useAccessibility();
  const { vibrateShort } = useVibration();
  const { speak } = useSpeech();

  const options = [
    { id: 'visual', label: 'Blind', emoji: '🙈' },
    { id: 'deaf', label: 'Deaf', emoji: '🙉' },
    { id: 'mute', label: 'Mute', emoji: '🙊' },
  ] as const;

  const hoverColors = ['hover:bg-neo-blue', 'hover:bg-neo-main', 'hover:bg-neo-purple'];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-20">
      <div className="grid grid-cols-3 gap-8 w-full max-w-4xl px-8">
        {options.map((option, index) => {
          const isSelected = selectedImpairments.includes(option.id);
          return (
            <button
              key={option.id}
              onClick={() => {
                toggleImpairment(option.id);
                vibrateShort();
                speak(`Selected ${option.label}`);
              }}
              onMouseEnter={() => window.dispatchEvent(new CustomEvent('show-cursor-gif'))}
              onMouseLeave={() => window.dispatchEvent(new CustomEvent('hide-cursor-gif'))}
              className={`
                relative group transition-all duration-300 transform
                aspect-square
                ${isSelected ? 'scale-[1.05]' : 'hover:-translate-y-2'}
              `}
            >
              <div className="absolute inset-0 bg-neo-black translate-x-2 translate-y-2 transition-transform group-hover:translate-x-4 group-hover:translate-y-4"></div>
              <div className={`
                relative neo-border w-full h-full flex items-center justify-center
                transition-colors duration-200
                ${isSelected ? 'bg-neo-accent' : `bg-neo-bg ${hoverColors[index % 3]}`}
              `}>
                <span className="text-7xl md:text-8xl transition-transform group-hover:scale-110 drop-shadow-sm select-none">
                  {option.emoji}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={onComplete}
        disabled={selectedImpairments.length === 0}
        className={`
          mt-16 relative group
          ${selectedImpairments.length === 0 ? 'opacity-30 grayscale cursor-not-none' : ''}
        `}
      >
        <div className="absolute inset-0 bg-neo-black translate-x-2 translate-y-2 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform"></div>
        <div className="relative neo-border bg-neo-main px-12 py-6 font-heavy text-3xl text-neo-white hover:-translate-y-1 hover:-translate-x-1 transition-transform active:translate-x-1 active:translate-y-1 uppercase italic tracking-tighter">
          COMMUNICATE →
        </div>
      </button>
    </div>
  );
};

export default ImpairmentSelection;
