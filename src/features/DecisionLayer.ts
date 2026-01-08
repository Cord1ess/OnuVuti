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

    private lastExpressionTime = 0;

    private setupListeners() {
        eventBus.on('gesture_detected', (data: { categoryName: string; score: number }) => {
            const now = Date.now();
            if (now - this.lastGestureTime > this.gestureCooldown) {
                let interactionType = '';

                switch (data.categoryName) {
                    case 'Thumb_Up': interactionType = '👍'; break;
                    case 'Thumb_Down': interactionType = '👎'; break;
                    case 'Victory': interactionType = '✌️'; break;
                    case 'Open_Palm': interactionType = '👋'; break; // Wave
                    case 'ILoveYou': interactionType = '🤟'; break;
                    default: return;
                }

                if (interactionType) {
                    console.log(`🧠 DecisionLayer: Decided on gesture ${interactionType}`);
                    this.onInteraction?.(interactionType);
                    this.lastGestureTime = now;
                }
            }
        });

        eventBus.on('expression_detected', (data: { expression: string; probability: number; timestamp: number }) => {
            const now = Date.now();
            // Higher cooldown for expressions to avoid spamming
            if (now - this.lastExpressionTime > 3000 && data.probability > 0.8) {
                let mappedEmoji = '';

                switch (data.expression) {
                    case 'happy': mappedEmoji = '😊'; break;
                    case 'angry': mappedEmoji = '😠'; break;
                    case 'surprised': mappedEmoji = '😮'; break;
                    case 'disgusted': mappedEmoji = '🤢'; break;
                    case 'sad': mappedEmoji = '😢'; break;
                    case 'fearful': mappedEmoji = '😨'; break;
                    default: return;
                }

                if (mappedEmoji) {
                    console.log(`🧠 DecisionLayer: Decided on expression ${data.expression} -> ${mappedEmoji}`);
                    this.onInteraction?.(mappedEmoji);
                    this.lastExpressionTime = now;
                }
            }
        });
    }
}

export const decisionLayer = new DecisionLayer();
