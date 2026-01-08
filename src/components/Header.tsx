import { useState, useEffect } from 'react';

const Header = () => {
  const [isEnglish, setIsEnglish] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsEnglish((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full flex justify-between items-center p-4 md:px-12 md:py-6 z-[100] bg-neo-accent border-b-4 border-neo-black">
        <div 
          className="group cursor-pointer relative h-12 w-64 flex items-center overflow-hidden"
          onClick={() => window.location.reload()}
        >
          <div 
            className={`absolute w-full transition-all duration-700 ease-in-out transform ${
              isEnglish ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'
            }`}
          >
            <h1 className="text-4xl font-heavy uppercase tracking-tighter text-neo-black hover:text-neo-main transition-colors">
              OnuVuti.
            </h1>
          </div>
          <div 
            className={`absolute w-full transition-all duration-700 ease-in-out transform ${
              !isEnglish ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
          >
            <h1 className="text-4xl font-heavy uppercase tracking-tighter text-neo-black hover:text-neo-main transition-colors">
              অনুভূতি.
            </h1>
          </div>
        </div>
        
        <nav className="hidden md:flex gap-8 font-heavy text-xl text-neo-black">
          <button className="hover:line-through decoration-4 decoration-neo-main transition-all uppercase tracking-widest px-2">CHAOS</button>
          <button className="hover:line-through decoration-4 decoration-neo-main transition-all uppercase tracking-widest px-2">CONNECT</button>
          <button className="neo-border bg-neo-black text-neo-white px-6 py-2 hover:bg-neo-main hover:-translate-x-1 hover:-translate-y-1 transition-all shadow-neo-sm">
            MANIFESTO
          </button>
        </nav>

        <div className="flex gap-4 items-center">
          <button className="neo-border bg-neo-white !p-2 cursor-pointer text-2xl hover:bg-neo-main transition-all shadow-neo-sm">
            ⚙️
          </button>
          <button className="md:hidden neo-border bg-neo-white !p-2 cursor-pointer text-2xl">
            ☰
          </button>
        </div>
    </header>
  );
};

export default Header;
