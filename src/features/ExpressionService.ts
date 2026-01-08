import * as faceapi from 'face-api.js';
import { cameraManager } from './CameraManager';
import { eventBus } from './EventBus';

class ExpressionService {
    private isLoaded = false;
    private isRunning = false;

    public async initialize(): Promise<void> {
        if (this.isLoaded) return;

        try {
            // Load models from a CDN or local public folder
            // For this example, we use a CDN for simplicity, but in production, self-hosting is better.
            const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
            ]);

            this.isLoaded = true;
            console.log('😊 ExpressionService: Initialized');
        } catch (error) {
            console.error('😊 ExpressionService: Initialization failed', error);
        }
    }

    public start(): void {
        if (!this.isLoaded) {
            console.warn('😊 ExpressionService: Not initialized');
            return;
        }
        if (this.isRunning) return;

        this.isRunning = true;
        this.loop();
        console.log('😊 ExpressionService: Started');
    }

    public stop(): void {
        this.isRunning = false;
        console.log('😊 ExpressionService: Stopped');
    }

    private loop = async () => {
        if (!this.isRunning) return;

        const video = cameraManager.getVideoElement();
        if (cameraManager.isReady()) {
            try {
                // options for Tiny Face Detector
                const options = new faceapi.TinyFaceDetectorOptions();

                const detections = await faceapi
                    .detectSingleFace(video, options)
                    .withFaceExpressions();

                if (detections) {
                    const expressions = detections.expressions;
                    // Find the dominant expression
                    const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
                    const [expression, probability] = sorted[0];

                    if (probability > 0.5) {
                        eventBus.emit('expression_detected', {
                            expression: expression as string,
                            probability: probability as number
                        });
                    }
                }
            } catch (e) {
                console.error("Expression detection error", e);
            }
        }

        // Run on next frame, but maybe throttle slightly if heavy
        requestAnimationFrame(this.loop);
    };
}

export const expressionService = new ExpressionService();
