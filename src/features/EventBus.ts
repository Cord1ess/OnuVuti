import mitt from 'mitt';

type Events = {
    gesture_detected: { categoryName: string; score: number };
    expression_detected: { expression: string; probability: number };
    camera_ready: void;
    interaction_triggered: { type: string; payload?: any };
};

export const eventBus = mitt<Events>();
