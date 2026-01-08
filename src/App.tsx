import { useState } from 'react';
import Header from './components/Header';
import ImpairmentSelection from './components/ImpairmentSelection';
import SensoryHub from './features/SensoryHub';
import CustomCursor from './components/CustomCursor';
import Loader from './components/Loader';

const App = () => {
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <div className="min-h-screen pb-20 bg-neo-bg font-body selection:bg-neo-black selection:text-neo-accent">
      <div className="grain"></div>
      <CustomCursor />
      <Loader />
      
      <Header />
      
      <main className="container mx-auto mt-8">
        {!hasStarted ? (
          <ImpairmentSelection onComplete={() => setHasStarted(true)} />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <SensoryHub />
          </div>
        )}
      </main>

    </div>
  );
};

export default App;
