import { eventBus } from './EventBus';

/**
 * Singleton class to manage camera access and video stream.
 * Ensures only one video stream is active and shared across consumers.
 */
class CameraManager {
    private static instance: CameraManager;
    private videoElement: HTMLVideoElement;
    private stream: MediaStream | null = null;
    private initializationPromise: Promise<void> | null = null;

    private constructor() {
        this.videoElement = document.createElement('video');
        this.videoElement.autoplay = true;
        this.videoElement.playsInline = true;
        // Hide the video element as it's for processing only, 
        // unless we want to debug/show self-view elsewhere
        this.videoElement.style.display = 'none';
        document.body.appendChild(this.videoElement);
    }

    public static getInstance(): CameraManager {
        if (!CameraManager.instance) {
            CameraManager.instance = new CameraManager();
        }
        return CameraManager.instance;
    }

    /**
     * Starts the camera stream if not already started.
     */
    public async start(): Promise<void> {
        if (this.stream) {
            return;
        }

        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = (async () => {
            try {
                this.stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 320, max: 320 },
                        height: { ideal: 240, max: 240 },
                        facingMode: 'user',
                    },
                    audio: false,
                });
                this.videoElement.srcObject = this.stream;
                await new Promise((resolve) => {
                    this.videoElement.onloadedmetadata = () => {
                        this.videoElement.play().then(() => resolve(null));
                    };
                });
                console.log('📸 CameraManager: Stream started');
                eventBus.emit('camera_ready');
            } catch (error) {
                console.error('📸 CameraManager: Failed to start stream', error);
                throw error;
            } finally {
                this.initializationPromise = null;
            }
        })();

        return this.initializationPromise;
    }

    /**
     * Stops the camera stream.
     */
    public stop(): void {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            this.videoElement.srcObject = null;
            console.log('📸 CameraManager: Stream stopped');
        }
    }

    /**
     * Returns the video element containing the active stream.
     */
    public getVideoElement(): HTMLVideoElement {
        return this.videoElement;
    }

    /**
     * Checks if the video is ready and playing
     */
    public isReady(): boolean {
        return !!this.stream && this.videoElement.readyState >= 2; // HAVE_CURRENT_DATA
    }
}

export const cameraManager = CameraManager.getInstance();
