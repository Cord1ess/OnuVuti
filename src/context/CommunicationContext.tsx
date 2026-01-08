import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { Impairment } from './AccessibilityContext';
import { eventBus } from '../features/EventBus';
import { io, Socket } from 'socket.io-client';
import { mediatorAgent } from '../features/MediatorAgent';
import { useAccessibility } from './AccessibilityContext';

export type ConnectionStatus = 'idle' | 'searching' | 'connected';

interface Message {
  id: string;
  sender: 'me' | 'peer';
  type: 'text' | 'emoji' | 'action' | 'gif';
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

const SOCKET_URL = 'http://localhost:3001';
const CommunicationContext = createContext<CommunicationContextType | undefined>(undefined);

export const CommunicationProvider = ({ children }: { children: ReactNode }) => {
  const { isVisuallyImpaired, isDeaf, isMute } = useAccessibility();
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [peer, setPeer] = useState<PeerProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGlitching, setIsGlitching] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const roomRef = useRef<string | null>(null);

  const triggerGlitch = useCallback(() => {
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 500);
  }, []);

  const triggerEnergy = useCallback((amount = 1) => {
    eventBus.emit('energy_impulse', amount);
  }, []);

  useEffect(() => {
    // Initialize Socket
    socketRef.current = io(SOCKET_URL, { autoConnect: false });

    socketRef.current.on('receive_signal', (data: any) => {
      const incomingMessage: Message = {
        id: Date.now().toString() + Math.random(),
        sender: 'peer',
        type: data.type,
        payload: data.payload,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, incomingMessage]);
      triggerGlitch();
      triggerEnergy(0.8);
      
      eventBus.emit('interaction_triggered', { type: 'peer_signal', payload: data });
    });

    socketRef.current.on('peer_joined', (data: any) => {
      setPeer({
        id: data.id,
        impairments: data.profile?.impairments || ['visual'], 
        name: 'Resonator'
      });
      setStatus('connected');
      mediatorAgent.start();
      triggerGlitch();
      triggerEnergy(1);
    });

    return () => {
      socketRef.current?.disconnect();
      mediatorAgent.stop();
    };
  }, [triggerGlitch, triggerEnergy]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    mediatorAgent.stop();
    setStatus('idle');
    setPeer(null);
    setMessages([]);
    triggerEnergy(0);
  }, [triggerEnergy]);

  const startMatching = useCallback(() => {
    setStatus('searching');
    setPeer(null);
    setMessages([]);

    const roomId = 'resonance-alpha'; 
    roomRef.current = roomId;
    
    const myImpairments = [];
    if (isVisuallyImpaired) myImpairments.push('visual');
    if (isDeaf) myImpairments.push('deaf');
    if (isMute) myImpairments.push('mute');

    socketRef.current?.connect();
    socketRef.current?.emit('join_resonance', { 
        roomId, 
        profile: { impairments: myImpairments } 
    });

    // Demo Mirror Fallback
    const timer = setTimeout(() => {
        if (!peer && roomRef.current) {
            setPeer({
                id: 'demo-peer',
                impairments: ['deaf'],
                name: 'Resonance Mirror'
            });
            setStatus('connected');
            mediatorAgent.start();
        }
    }, 5000);

    return () => clearTimeout(timer);
  }, [peer]);

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
    eventBus.emit('interaction_triggered', { type: 'user_signal', payload: { type, payload } });

    if (socketRef.current?.connected && roomRef.current) {
        socketRef.current.emit('send_signal', {
            roomId: roomRef.current,
            type,
            payload,
            senderId: socketRef.current.id
        });
    }

    if (peer?.id === 'demo-peer') {
      setTimeout(() => {
        let response = '';
        let respType: Message['type'] = 'text';

        if (payload.includes('👋') || payload.toLowerCase().includes('hello')) {
            response = "Hello! I can feel your wave.";
        } else if (payload.includes('❤️')) {
            response = "❤️";
            respType = 'emoji';
        } else if (type === 'gif') {
            response = "https://media.tenor.com/images/eba4a6136df3f2a8999052d96204369a/tenor.gif"; // Happy nod
            respType = 'gif';
        } else if (payload.includes('😊')) {
            response = "Your happiness resonates with me.";
        } else {
            const responses = ['❤️', '🔥', '🙌', 'I feel as you feel.', 'Resonance shift detected.'];
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
  }, [peer, triggerGlitch, triggerEnergy]);

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
