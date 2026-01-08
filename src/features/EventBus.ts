import mitt from 'mitt';

type Events = {
    gesture_detected: { categoryName: string; score: number };
    expression_detected: { expression: string; probability: number; timestamp: number };
    camera_ready: void;
    interaction_triggered: { type: string; payload?: any };
    energy_impulse: number;
    speech_triggered: string;
};

export const eventBus = mitt<Events>();
