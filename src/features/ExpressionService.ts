import * as faceapi from '@vladmandic/face-api';
import { cameraManager } from './CameraManager';
import { eventBus } from './EventBus';

/**
 * Configuration for Face API Optimization
 * Following strict performance constraints.
 */
const FACE_DETECTION_CONFIG = {
    modelUrl: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/',
    detectIntervalMs: 800, // Faster interval for better mood response
    idleTimeoutMs: 60000,
    tinyDetectorOptions: {
        inputSize: 224,     // Slightly larger for better accuracy
        scoreThreshold: 0.4 // Lower threshold to detect subtle movements
    }
};

class ExpressionService {
    private isLoaded = false;
    private isRunning = false;
    private intervalId: number | null = null;
    private lastInteractionTime = Date.now();
    private currentEmotion: { expression: string, probability: number } | null = null;

    constructor() {
        // Track user activity for idle detection
        if (typeof window !== 'undefined') {
            const updateActivity = () => { this.lastInteractionTime = Date.now(); };
            window.addEventListener('mousemove', updateActivity);
            window.addEventListener('keydown', updateActivity);
            window.addEventListener('touchstart', updateActivity);
        }
    }

    public async initialize(): Promise<void> {
        if (this.isLoaded) return;

        try {
            console.log('😊 ExpressionService: Starting initialization sequence...');
            
            const tf = faceapi.tf as any;
            try {
                await tf.setBackend('webgl');
                console.log('😊 ExpressionService: WebGL Backend Set');
            } catch (e) {
                console.warn('😊 ExpressionService: WebGL not available, falling back to CPU');
                await tf.setBackend('cpu');
            }
            
            await tf.ready();
            console.log(`😊 ExpressionService: Using backend: ${tf.getBackend()}`);

            console.log('😊 ExpressionService: Loading models (TinyFace + ExpressionNet)...');
            
            // Explicitly load each model with logging
            try {
                await faceapi.nets.tinyFaceDetector.loadFromUri(FACE_DETECTION_CONFIG.modelUrl);
                console.log('😊 ExpressionService: TinyFaceDetector Loaded');
                await faceapi.nets.faceExpressionNet.loadFromUri(FACE_DETECTION_CONFIG.modelUrl);
                console.log('😊 ExpressionService: FaceExpressionNet Loaded');
            } catch (modelError) {
                console.error('😊 ExpressionService: Model fetch failed. Verify network connection and CDN availability.', modelError);
                throw modelError;
            }

            this.isLoaded = true;
            console.log('😊 ExpressionService: FULLY INITIALIZED');
        } catch (error) {
            console.error('😊 ExpressionService: Initialization failed', error);
        }
    }

    public start(): void {
        if (!this.isLoaded) {
            console.warn('😊 ExpressionService: Cannot start, models not loaded.');
            return;
        }
        if (this.isRunning) return;

        this.isRunning = true;
        
        // Constraint: Use setInterval instead of requestAnimationFrame
        this.intervalId = window.setInterval(
            this.detectLoop, 
            FACE_DETECTION_CONFIG.detectIntervalMs
        );
        
        console.log('😊 ExpressionService: Detection loop started');
    }

    public stop(): void {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        console.log('😊 ExpressionService: Stopped');
    }

    /**
     * Main detection loop
     * Runs periodically to minimize CPU usage.
     */
    private detectLoop = async () => {
        // 1. Check if we should skip detection
        if (!this.shouldRunDetection()) return;

        if (!cameraManager.isReady()) return;
        const video = cameraManager.getVideoElement();
        
        try {
            const options = new faceapi.TinyFaceDetectorOptions(FACE_DETECTION_CONFIG.tinyDetectorOptions);

            // One-time trace to verify the loop is actually executing on a video source
            if (!this.currentEmotion) {
               // We only log this once to avoid flooding the console
               // console.debug("😊 Mood Engine: Scanning video frame...");
            }

            const detection = await faceapi
                .detectSingleFace(video, options)
                .withFaceExpressions();

            if (detection) {
                if (!this.currentEmotion) console.log("😊 Mood Engine: Face Targeted - TARGET ACQUIRED");
                this.processExpressions(detection.expressions);
            } else {
                // If no face found, emit a clear state occasionally
                if (this.currentEmotion) {
                   this.currentEmotion = null;
                   eventBus.emit('expression_detected', { expression: 'neutral', probability: 0, timestamp: Date.now() });
                }
            }
        } catch (error) {
            console.error("😊 Expression Loop Error:", error);
        }
    };

    /**
     * Determines if detection should run based on system state
     */
    private shouldRunDetection(): boolean {
        // Skip if tab is not focused
        if (document.hidden) return false;

        // Skip if user is idle
        const isIdle = (Date.now() - this.lastInteractionTime) > FACE_DETECTION_CONFIG.idleTimeoutMs;
        if (isIdle) return false;

        return true;
    }

    /**
     * Processes raw expression data and emits only relevant changes
     */
    private processExpressions(expressions: faceapi.FaceExpressions) {
        // Sort and find dominant expression
        const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
        const [expression, probability] = sorted[0];

        // Filter out low confidence - Lowered to 0.4 to match detector sensitivity
        if (probability < 0.4) return;

        // Debounce/Stability check: Only emit if significantly different or if it's been a while
        // For simplicity and responsiveness, we emit "dominant_emotion" updates.
        // The consumer (UI) validates if it needs to update the DOM.
        
        // UX Rule: "Do not display raw emotion percentages" -> handled by UI, we just send data.
        // We structure the payload to match requirements: dominant, confidence, timestamp.
        
        if (!this.currentEmotion || this.currentEmotion.expression !== expression || Math.abs(this.currentEmotion.probability - probability) > 0.05) {
            this.currentEmotion = { expression, probability };
            
            eventBus.emit('expression_detected', {
                expression: expression,
                probability: probability,
                timestamp: Date.now()
            });
        }
    }
}

export const expressionService = new ExpressionService();
