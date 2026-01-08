import { useState } from 'react';
import Emoji from './Emoji';

interface ExpressionComposerProps {
  onSend: (message: string) => void;
}

const ExpressionComposer = ({ onSend }: ExpressionComposerProps) => {
  const [composerItems, setComposerItems] = useState<string[]>([]);

  const options = [
    { label: 'ACTION', items: ['👋', '🙏', '🤝', '🚶', '🏃', '✋'] },
    { label: 'OBJECT', items: ['🍎', '💧', '🏠', '❤️', '💊', '❓'] },
    { label: 'EMOTION', items: ['😊', '😢', '😡', '😱', '😴', '✨'] },
  ];

  const addItem = (item: string) => {
    if (composerItems.length < 5) {
      setComposerItems([...composerItems, item]);
    }
  };

  const removeItem = (index: number) => {
    setComposerItems(composerItems.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-neo-black text-neo-white neo-border">
      <div className="flex justify-between items-center border-b-2 border-neo-white pb-4">
        <h3 className="font-heavy uppercase text-xl italic text-neo-accent">Expression Composer</h3>
        <span className="text-xs opacity-50 uppercase tracking-widest">{composerItems.length}/5 Intents</span>
      </div>

      {/* Composition Area */}
      <div className="min-h-[100px] neo-border bg-neo-white p-4 flex gap-4 overflow-x-auto items-center">
        {composerItems.length === 0 ? (
          <span className="text-neo-black opacity-30 italic font-body uppercase tracking-tighter">Staging area empty...</span>
        ) : (
          composerItems.map((item, i) => (
            <button 
              key={i} 
              onClick={() => removeItem(i)}
              className="text-5xl hover:scale-110 transition-transform relative group"
            >
               <Emoji char={item} />
               <div className="absolute -top-2 -right-2 bg-neo-main text-neo-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100">✕</div>
            </button>
          ))
        )}
      </div>

      {/* Tools Cabinet */}
      <div className="space-y-4">
        {options.map((group) => (
          <div key={group.label} className="space-y-2">
            <span className="text-[10px] font-heavy opacity-50 uppercase tracking-widest">{group.label}</span>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {group.items.map(item => (
                <button 
                  key={item}
                  onClick={() => addItem(item)}
                  className="bg-neo-white text-neo-black p-3 neo-border hover:bg-neo-accent transition-colors flex-shrink-0"
                >
                  <Emoji char={item} className="text-2xl" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Dispatch */}
      <button 
        onClick={() => {
          if (composerItems.length > 0) {
            onSend(composerItems.join(' '));
            setComposerItems([]);
          }
        }}
        disabled={composerItems.length === 0}
        className={`
          w-full py-4 font-heavy text-2xl uppercase italic transition-all
          ${composerItems.length > 0 ? 'bg-neo-accent text-neo-black hover:-translate-y-1 hover:shadow-neo-sm active:translate-y-0' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}
        `}
      >
        Dispatch Intent →
      </button>
    </div>
  );
};

export default ExpressionComposer;
