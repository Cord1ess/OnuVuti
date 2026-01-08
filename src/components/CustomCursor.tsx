import { useEffect, useRef, useState } from 'react';
import pointerNormal from '../assets/Pointer.svg';
import pointerClick from '../assets/Pointer On Click.svg';
import introGif from '../assets/Introduction Gif.gif';

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isClicking, setIsClicking] = useState(false);
  const [showGif, setShowGif] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Force cursor: none on the entire document and all sub-elements
    const style = document.createElement('style');
    style.innerHTML = `
      * { 
        cursor: none !important; 
      }
      body {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    const onMouseMove = (e: MouseEvent) => {
      // Direct positioning for absolute zero lag
      if (cursor) {
        cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    const handleShowGif = () => setShowGif(true);
    const handleHideGif = () => setShowGif(false);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    
    // Custom events for gif preview
    window.addEventListener('show-cursor-gif', handleShowGif);
    window.addEventListener('hide-cursor-gif', handleHideGif);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('show-cursor-gif', handleShowGif);
      window.removeEventListener('hide-cursor-gif', handleHideGif);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      id="custom-cursor"
      className="fixed top-0 left-0 pointer-events-none z-[999999] will-change-transform"
      style={{
        transform: 'translate3d(0, 0, 0)',
        left: 0,
        top: 0
      }}
    >
      <div className="relative">
        {/* GIF Preview Box */}
        <div className={`
          absolute bottom-full left-full mb-4 ml-4 transition-all duration-300 transform origin-bottom-left
          ${showGif ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
        `}>
          <div className="neo-border bg-neo-white p-1 w-40 h-40 overflow-hidden shadow-neo-sm">
            <img src={introGif} alt="Intro preview" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Cursor Icon */}
        <img 
          src={isClicking ? pointerClick : pointerNormal} 
          alt="cursor"
          className="w-12 h-12 object-contain"
          draggable="false"
        />
      </div>
    </div>
  );
};

export default CustomCursor;
