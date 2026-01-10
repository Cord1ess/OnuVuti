import * as faceapi from '@vladmandic/face-api';
import { cameraManager } from './CameraManager';
import { eventBus } from './EventBus';

/**
 * Configuration for Face API Optimization
 * Following strict performance constraints.
 */
const FACE_DETECTION_CONFIG = {
    modelUrl: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/',
    detectIntervalMs: 250, 
    idleTimeoutMs: 2147483647,
    tinyDetectorOptions: {
        inputSize: 320,      // Sweet spot for mobile (320px)
        scoreThreshold: 0.2  // Permissive detection
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
            window.addEventListener('scroll', updateActivity); // Better for mobile
            window.addEventListener('touchstart', updateActivity);
            window.addEventListener('click', updateActivity);
        }
    }

    public async initialize(): Promise<void> {
        if (this.isLoaded) return;

        try {
            console.log('😊 ExpressionService: Starting initialization sequence...');
            
            const tf = faceapi.tf as any;
            try {
                // Default to WebGL - standard for face-api.js
                await tf.setBackend('webgl'); 
                console.log('😊 ExpressionService: Backend set to WebGL');
            } catch (e) {
                console.warn('😊 ExpressionService: WebGL failed, trying CPU');
                await tf.setBackend('cpu');
            }
            
            await tf.ready();
            console.log(`😊 ExpressionService: Using backend: ${tf.getBackend()}`);

            console.log('😊 ExpressionService: Loading models (TinyFace + ExpressionNet)...');
            
            // Explicitly load each model with logging
            // Parallel Loading for faster startup
            try {
                const p1 = faceapi.nets.tinyFaceDetector.loadFromUri(FACE_DETECTION_CONFIG.modelUrl);
                const p2 = faceapi.nets.faceExpressionNet.loadFromUri(FACE_DETECTION_CONFIG.modelUrl);
                
                await Promise.all([p1, p2]);
                console.log('😊 ExpressionService: All models loaded concurrently');
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

    private isDetecting = false; // Semaphore to prevent overlapping calls

    /**
     * Main detection loop
     * Runs periodically to minimize CPU usage.
     */
    private detectLoop = async () => {
        // 0. Prevent overlap (CPU choke fix)
        if (this.isDetecting) return;
        this.isDetecting = true;

        // 1. Check if we should skip detection
        if (!this.shouldRunDetection()) {
            this.isDetecting = false; 
            return;
        }

        if (!cameraManager.isReady()) {
            this.isDetecting = false;
            return;
        }
        const video = cameraManager.getVideoElement();
        
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            this.isDetecting = false;
            return;
        }

        try {
            const options = new faceapi.TinyFaceDetectorOptions(FACE_DETECTION_CONFIG.tinyDetectorOptions);

            const detection = await faceapi
                .detectSingleFace(video, options)
                .withFaceExpressions();

            if (detection) {
                // console.log("😊 Mood Engine: Face DETECTED", detection.expressions);
                this.processExpressions(detection.expressions);
            } else {
                // console.log("😊 Mood Engine: Detection loop ran, but NO FACE found.");
                
                if (this.currentEmotion) {
                   this.currentEmotion = null;
                   eventBus.emit('expression_detected', { expression: 'neutral', probability: 0, timestamp: Date.now() });
                }
            }
        } catch (error) {
            console.error("😊 Expression Loop Error:", error);
        } finally {
            this.isDetecting = false;
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

        // Filter out low confidence
        if (probability < 0.2) return;

        // Debounce/Stability check: Only emit if significantly different or if it's been a while
        // For simplicity and responsiveness, we emit "dominant_emotion" updates.
        // The consumer (UI) validates if it needs to update the DOM.
        
        // UX Rule: "Do not display raw emotion percentages" -> handled by UI, we just send data.
        // We structure the payload to match requirements: dominant, confidence, timestamp.
        
        if (!this.currentEmotion || this.currentEmotion.expression !== expression || Math.abs(this.currentEmotion.probability - probability) > 0.02) {
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
