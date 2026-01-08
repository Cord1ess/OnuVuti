import { useEffect } from 'react';

const Loader = () => {
  useEffect(() => {
    // Basic auto-hide for demo
    const timer = setTimeout(() => {
      const loader = document.getElementById('loader');
      if (loader) {
        loader.style.transform = 'translateY(-100%)';
        loader.style.transition = 'transform 0.8s cubic-bezier(0.87, 0, 0.13, 1)';
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div id="loader" className="fixed inset-0 bg-neo-black z-[10000] flex flex-col items-center justify-center overflow-hidden">
        <div className="flex gap-2 h-32 items-end mb-8">
            <div className="w-5 h-[100%] bg-neo-accent animate-[bounce_1s_infinite_0s]"></div>
            <div className="w-5 h-[100%] bg-neo-accent animate-[bounce_1s_infinite_0.1s]"></div>
            <div className="w-5 h-[100%] bg-neo-accent animate-[bounce_1s_infinite_0.2s]"></div>
            <div className="w-5 h-[100%] bg-neo-accent animate-[bounce_1s_infinite_0.3s]"></div>
            <div className="w-5 h-[100%] bg-neo-accent animate-[bounce_1s_infinite_0.4s]"></div>
        </div>
        <h1 className="text-neo-bg font-display font-bold text-6xl tracking-tighter italic">LOADING</h1>
    </div>
  );
};

export default Loader;
