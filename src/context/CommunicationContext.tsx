import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Impairment } from './AccessibilityContext';

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
  energy: number; // 0 to 1
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
  const [energy, setEnergy] = useState(0);

  // Energy decay loop
  useEffect(() => {
    if (energy <= 0) return;
    const timer = setInterval(() => {
      setEnergy(prev => Math.max(0, prev - 0.05));
    }, 50);
    return () => clearInterval(timer);
  }, [energy]);

  const triggerGlitch = useCallback(() => {
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 500);
  }, []);

  const triggerEnergy = useCallback((amount = 1) => {
    setEnergy(prev => Math.min(1, prev + amount));
  }, []);

  const disconnect = useCallback(() => {
    setStatus('idle');
    setPeer(null);
    setMessages([]);
    setEnergy(0);
  }, []);

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
        const responses = ['❤️', '🔥', '🙌', 'Hello!', 'I feel you.', 'Interesting...'];
        const peerMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'peer',
          type: Math.random() > 0.5 ? 'text' : 'emoji',
          payload: responses[Math.floor(Math.random() * responses.length)],
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
      status, peer, messages, isGlitching, energy, 
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
