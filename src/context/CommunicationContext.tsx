import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { Impairment } from './AccessibilityContext';
import { eventBus } from '../features/EventBus';
import { io, Socket } from 'socket.io-client';
import { mediatorAgent } from '../features/MediatorAgent';
import { useAccessibility } from './AccessibilityContext';

export type ConnectionStatus = 'idle' | 'searching' | 'connected' | 'error';

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
    // Initialize Socket with reconnection logic
    socketRef.current = io(SOCKET_URL, { 
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Connected to Resonance Server');
      const roomId = 'resonance-alpha';
      roomRef.current = roomId;
      const myImpairments = [];
      if (isVisuallyImpaired) myImpairments.push('visual');
      if (isDeaf) myImpairments.push('deaf');
      if (isMute) myImpairments.push('mute');

      socketRef.current?.emit('join_resonance', { 
          roomId, 
          profile: { impairments: myImpairments } 
      });
    });

    socketRef.current.on('connect_error', () => {
      setStatus('error');
    });

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
      console.log('🌌 Peer Joined:', data.id);
      setPeer({
        id: data.id,
        impairments: data.profile?.impairments || [], 
        name: 'Resonator'
      });
      setStatus('connected');
      mediatorAgent.start();
      triggerGlitch();
      triggerEnergy(1);
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Disconnected from Server');
      if (status === 'connected') setStatus('idle');
      setPeer(null);
      mediatorAgent.stop();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      mediatorAgent.stop();
    };
  }, [triggerGlitch, triggerEnergy]); // Removed 'status' dependency to prevent reconnection on state change

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

    if (socketRef.current?.connected) {
      // If already connected, just join
      const roomId = 'resonance-alpha';
      roomRef.current = roomId;
      const myImpairments = [];
      if (isVisuallyImpaired) myImpairments.push('visual');
      if (isDeaf) myImpairments.push('deaf');
      if (isMute) myImpairments.push('mute');

      socketRef.current.emit('join_resonance', { 
          roomId: 'resonance-alpha', 
          profile: { impairments: myImpairments } 
      });
    } else {
      socketRef.current?.connect();
    }
  }, [isVisuallyImpaired, isDeaf, isMute]);

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
  }, [triggerEnergy]);

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
