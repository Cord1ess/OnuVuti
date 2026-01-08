import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Impairment } from './AccessibilityContext';
import { eventBus } from '../features/EventBus';

export type ConnectionStatus = 'idle' | 'searching' | 'connected';

interface Message {
  id: string;
  sender: 'me' | 'peer';
  type: 'text' | 'emoji' | 'action';
  payload: string;
  timestamp: number;
}

interface PeerProfile {
  id: string;
  impairments: Impairment[];
  name: string;
}

interface CommunicationContextType {
  status: ConnectionStatus;
  peer: PeerProfile | null;
  messages: Message[];
  isGlitching: boolean;
  startMatching: () => void;
  disconnect: () => void;
  sendMessage: (type: Message['type'], payload: string) => void;
}

const CommunicationContext = createContext<CommunicationContextType | undefined>(undefined);

export const CommunicationProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [peer, setPeer] = useState<PeerProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGlitching, setIsGlitching] = useState(false);

  const triggerGlitch = useCallback(() => {
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 500);
  }, []);

  const triggerEnergy = useCallback((amount = 1) => {
    eventBus.emit('energy_impulse', amount);
  }, []);

  const disconnect = useCallback(() => {
    setStatus('idle');
    setPeer(null);
    setMessages([]);
    triggerEnergy(0);
  }, [triggerEnergy]);

  const startMatching = useCallback(() => {
    setStatus('searching');
    setPeer(null);
    setMessages([]);

    const timer = setTimeout(() => {
      const randomImpairments: Impairment[] = [];
      const possibilities: Impairment[] = ['visual', 'deaf', 'mute'];
      const count = Math.floor(Math.random() * 2) + 1;
      
      for (let i = 0; i < count; i++) {
        const choice = possibilities[Math.floor(Math.random() * possibilities.length)];
        if (!randomImpairments.includes(choice)) {
          randomImpairments.push(choice);
        }
      }

      setPeer({
        id: Math.random().toString(36).substr(2, 9),
        impairments: randomImpairments,
        name: 'Anonymous Peer'
      });
      setStatus('connected');
      triggerGlitch();
      triggerEnergy(1);

      // MOCK INITIAL MESSAGE
      setTimeout(() => {
        const welcomeMsg: Message = {
          id: 'welcome-peer',
          sender: 'peer',
          type: 'text',
          payload: "Connection established. I'm listening through my sensory hub.",
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, welcomeMsg]);
        triggerGlitch();
      }, 1000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [triggerGlitch, triggerEnergy]);

  const sendMessage = useCallback((type: Message['type'], payload: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      type,
      payload,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMessage]);
    triggerEnergy(0.5);

    if (status === 'connected') {
      setTimeout(() => {
        let response = '';
        let respType: Message['type'] = 'text';

        // MOCK INTELLIGENT RESPONSES
        if (payload.includes('👋') || payload.toLowerCase().includes('hello')) {
            response = "Hello! I can feel your wave.";
        } else if (payload.includes('❤️')) {
            response = "❤️";
            respType = 'emoji';
        } else if (payload.includes('😊')) {
            response = "Your happiness resonates with me.";
        } else if (payload.includes('😢')) {
            response = "I feel your sadness. I'm here.";
        } else {
            const responses = ['❤️', '🔥', '🙌', 'I feel you.', 'Interesting...', 'Resonance shift detected.'];
            response = responses[Math.floor(Math.random() * responses.length)];
            respType = response.length <= 2 ? 'emoji' : 'text';
        }

        const peerMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'peer',
          type: respType,
          payload: response,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, peerMessage]);
        triggerGlitch();
        triggerEnergy(0.8);
      }, 2000);
    }
  }, [status, triggerGlitch, triggerEnergy]);

  return (
    <CommunicationContext.Provider value={{ 
      status, peer, messages, isGlitching,
      startMatching, disconnect, sendMessage 
    }}>
      {children}
    </CommunicationContext.Provider>
  );
};

export const useCommunication = () => {
  const context = useContext(CommunicationContext);
  if (context === undefined) {
    throw new Error('useCommunication must be used within a CommunicationProvider');
  }
  return context;
};
