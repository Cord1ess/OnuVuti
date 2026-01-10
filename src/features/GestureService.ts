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
            console.log("🙌 GestureService: Loading WASM from CDN...");
            const vision = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
            );

            this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath:
                        'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
                    delegate: 'CPU', // GPU is unstable on many mobile browsers
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

    private lastProcessTime = 0;
    private readonly THROTTLE_MS = 150; // ~6 FPS is fine for gestures

    private loop = async () => {
        if (!this.isRunning) return;

        const now = Date.now();
        const video = cameraManager.getVideoElement();

        if (cameraManager.isReady() && video.currentTime !== this.lastVideoTime && (now - this.lastProcessTime >= this.THROTTLE_MS)) {
            this.lastVideoTime = video.currentTime;
            this.lastProcessTime = now;

            try {
                // MediaPipe requires high-res timestamp
                const result = this.gestureRecognizer?.recognizeForVideo(video, performance.now());

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
