import { eventBus } from './EventBus';

/**
 * OnuVuti-Core: Interaction Mediator Agent
 * Facilitates meaningful, non-verbal communication between users.
 * Invisible to users, acts as a subtle balance layer.
 */
class MediatorAgent {
    private consecutiveSignalsFromMe = 0;
    private lastEmotions: string[] = [];
    private silenceThreshold = 10000; // 10 seconds
    private silenceTimer: any = null;
    private isRunning = false;

    constructor() {
        this.setupListeners();
    }

    public start() {
        this.isRunning = true;
        this.resetSilenceTimer();
        console.log('🤖 MediatorAgent: Resonance Monitor Active');
    }

    public stop() {
        this.isRunning = false;
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
    }

    private setupListeners() {
        // Monitor outgoing signals
        eventBus.on('expression_detected', (data) => {
            if (!this.isRunning) return;
            this.handleUserSignal('expression', data.expression);
        });

        eventBus.on('gesture_detected', (data) => {
            if (!this.isRunning) return;
            this.handleUserSignal('gesture', data.categoryName);
        });

        // Monitor incoming signals from peer (relayed via CommunicationContext)
        eventBus.on('interaction_triggered', (data) => {
            if (!this.isRunning) return;
            // If it's an interaction we triggered, or a peer one
            this.resetSilenceTimer();
            // Reset imbalance if peer responds
            if (data.type === 'peer_signal') {
                this.consecutiveSignalsFromMe = 0;
            }
            if (data.type === 'user_signal') {
                this.handleUserSignal(data.payload.type, data.payload.payload);
            }
        });
    }

    private handleUserSignal(type: string, value: any) {
        console.log(`🤖 MediatorAgent: User sent ${type} (${value})`);
        this.resetSilenceTimer();
        this.consecutiveSignalsFromMe++;

        // Intervention: Check for imbalance
        if (this.consecutiveSignalsFromMe >= 3) {
            console.log('🤖 MediatorAgent: Imbalance detected. Encouraging passive user.');
            eventBus.emit('energy_impulse', 0.4);
            eventBus.emit('interaction_triggered', { type: 'mediator_nudge', payload: 'balance' });
            this.consecutiveSignalsFromMe = 0; 
        }
    }

    private resetSilenceTimer() {
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
        this.silenceTimer = setTimeout(() => {
            this.onSilenceDetected();
        }, this.silenceThreshold);
    }

    private onSilenceDetected() {
        if (!this.isRunning) return;
        console.log('🤖 MediatorAgent: Silence threshold reached. Suggesting low-effort signal.');
        
        eventBus.emit('energy_impulse', 0.2); 
        eventBus.emit('interaction_triggered', { type: 'mediator_nudge', payload: 'silence' });
        
        this.resetSilenceTimer();
    }

    /**
     * Amplify detected emotion
     */
    public amplifySignal(emotion: string) {
        if (!this.isRunning) return;

        // Confusion Detection
        this.lastEmotions.push(emotion);
        if (this.lastEmotions.length > 3) this.lastEmotions.shift();
        
        const isConfusion = this.lastEmotions.length === 3 && 
                           new Set(this.lastEmotions).size >= 3;

        if (isConfusion) {
            console.log('🤖 MediatorAgent: Confusion detected. Sending stabilizing impulse.');
            eventBus.emit('energy_impulse', 0.5);
            eventBus.emit('interaction_triggered', { type: 'mediator_nudge', payload: 'stabilize' });
            this.lastEmotions = []; // Reset after trigger
        }

        const intensities: Record<string, number> = {
            'happy': 0.6,
            'surprised': 0.8,
            'angry': 0.9,
            'sad': 0.3
        };
        const intensity = intensities[emotion] || 0.5;
        eventBus.emit('energy_impulse', intensity);
    }
}

export const mediatorAgent = new MediatorAgent();
