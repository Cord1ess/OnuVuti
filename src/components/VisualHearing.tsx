import { useEffect, useRef } from 'react';
const VisualHearing = ({ active, energy = 0 }: { active: boolean; energy?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = 200;
    };
    window.addEventListener('resize', resize);
    resize();

    let offset = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const energyBoost = 1 + energy * 2;
      ctx.lineWidth = 4 + energy * 6;
      ctx.strokeStyle = '#00E5FF'; // neo-blue
      ctx.beginPath();

      const sliceWidth = canvas.width / 100;
      let x = 0;

      for (let i = 0; i < 100; i++) {
        const v = (Math.sin((i + offset) * 0.2) * 20 + Math.sin((i + offset) * 0.5) * 10) * energyBoost;
        const y = canvas.height / 2 + v;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += sliceWidth;
      }

      ctx.stroke();

      // Second layer
      ctx.strokeStyle = '#FF4D00'; // neo-main
      ctx.beginPath();
      x = 0;
      for (let i = 0; i < 100; i++) {
        const v = (Math.cos((i + offset) * 0.3) * 15) * energyBoost;
        const y = canvas.height / 2 + v;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();

      offset += 0.5 + energy * 1.5;
      requestRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [active]);

  return (
    <div className="w-full h-[200px] neo-border bg-neo-black overflow-hidden relative">
      <div className="absolute top-2 left-4 text-neo-white font-heavy text-xs uppercase opacity-50 tracking-widest z-10">
        Audio Visualizer Engine
      </div>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default VisualHearing;
