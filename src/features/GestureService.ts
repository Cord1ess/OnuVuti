import { GestureRecognizer, FilesetResolver } from '@mediapipe/tasks-vision';
import { cameraManager } from './CameraManager';
import { eventBus } from './EventBus';

class GestureService {
    private gestureRecognizer: GestureRecognizer | null = null;
    private isRunning = false;
    private lastVideoTime = -1;

    public async initialize(): Promise<void> {
        if (this.gestureRecognizer) return;

        try {
            const vision = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
            );

            this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath:
                        'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
                    delegate: 'GPU',
                },
                runningMode: 'VIDEO',
            });
            console.log('🙌 GestureService: Initialized');
        } catch (error) {
            console.error('🙌 GestureService: Initialization failed', error);
        }
    }

    public start(): void {
        if (!this.gestureRecognizer) {
            console.warn('🙌 GestureService: Not initialized');
            return;
        }
        if (this.isRunning) return;

        this.isRunning = true;
        this.loop();
        console.log('🙌 GestureService: Started');
    }

    public stop(): void {
        this.isRunning = false;
        console.log('🙌 GestureService: Stopped');
    }

    private loop = async () => {
        if (!this.isRunning) return;

        const video = cameraManager.getVideoElement();
        if (cameraManager.isReady() && video.currentTime !== this.lastVideoTime) {
            this.lastVideoTime = video.currentTime;

            try {
                const result = this.gestureRecognizer?.recognizeForVideo(video, Date.now());

                if (result && result.gestures.length > 0) {
                    const topGesture = result.gestures[0][0];
                    if (topGesture && topGesture.score > 0.5) { // Confidence threshold
                        eventBus.emit('gesture_detected', {
                            categoryName: topGesture.categoryName,
                            score: topGesture.score
                        });
                    }
                }
            } catch (e) {
                console.error("Gesture recognition error", e);
            }
        }

        requestAnimationFrame(this.loop);
    };
}

export const gestureService = new GestureService();
