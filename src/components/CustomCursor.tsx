import { useEffect, useState } from 'react';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const onMouseEnter = () => setIsHovering(true);
    const onMouseLeave = () => setIsHovering(false);

    window.addEventListener('mousemove', onMouseMove);
    
    const interactables = document.querySelectorAll('button, a, .interactive');
    interactables.forEach(el => {
      el.addEventListener('mouseenter', onMouseEnter);
      el.addEventListener('mouseleave', onMouseLeave);
    });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      interactables.forEach(el => {
        el.removeEventListener('mouseenter', onMouseEnter);
        el.removeEventListener('mouseleave', onMouseLeave);
      });
    };
  }, []);

  return (
    <div
      id="cursor"
      className="fixed top-0 left-0 w-6 h-6 bg-neo-black pointer-events-none z-[9999] mix-blend-difference transition-all duration-200 ease-out"
      style={{
        transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
        width: isHovering ? '60px' : '24px',
        height: isHovering ? '60px' : '24px',
        backgroundColor: isHovering ? '#A3FF00' : '#0f0f0f',
        clipPath: isHovering ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : 'none',
      }}
    />
  );
};

export default CustomCursor;
