import { eventBus } from './EventBus';

type InteractionCallback = (type: string, payload?: any) => void;

class DecisionLayer {
    private onInteraction: InteractionCallback | null = null;
    private lastGestureTime = 0;
    private gestureCooldown = 1500; // ms

    constructor() {
        this.setupListeners();
    }

    public setInteractionHandler(handler: InteractionCallback) {
        this.onInteraction = handler;
    }

    private setupListeners() {
        eventBus.on('gesture_detected', (data: { categoryName: string; score: number }) => {
            const now = Date.now();
            if (now - this.lastGestureTime > this.gestureCooldown) {
                // Map gestures to emojis or actions
                // MediaPipe gestures: "Closed_Fist", "Open_Palm", "Pointing_Up", "Thumb_Down", "Thumb_Up", "Victory", "ILoveYou"
                let interactionType = '';

                switch (data.categoryName) {
                    case 'Thumb_Up': interactionType = '👍'; break;
                    case 'Thumb_Down': interactionType = '👎'; break;
                    case 'Victory': interactionType = '✌️'; break;
                    case 'Open_Palm': interactionType = '👋'; break; // Wave
                    case 'ILoveYou': interactionType = '🤟'; break;
                    default: return; // Ignore others for now
                }

                if (interactionType) {
                    console.log(`🧠 DecisionLayer: Decided on gesture ${interactionType}`);
                    this.onInteraction?.(interactionType);
                    this.lastGestureTime = now;
                }
            }
        });

        eventBus.on('expression_detected', (data: { expression: string; probability: number }) => {
            // Expressions are continuous, so we might not want to trigger "interaction" events 
            // the same way as discrete gestures, or maybe we do but throttled.
            // For now, let's just log or potentialy update a state if we had one.
            // The UI might subscribe to 'expression_detected' directly for continuous updates (like the "JOLLY" text).
            // But if we want to trigger an "interaction" (like playing a sound), we could do it here.

            // Example: if "surprised" -> trigger 😮
            if (data.expression === 'surprised' && data.probability > 0.8) {
                // Throttling would be needed here too
            }
        });
    }
}

export const decisionLayer = new DecisionLayer();
