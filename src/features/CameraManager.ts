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
        this.videoElement.playsInline = true; // Critical for iOS
        this.videoElement.setAttribute('playsinline', 'true'); // Explicit attribute for Safari
        // Hide the video element as it's for processing only
        // unless we want to debug/show self-view elsewhere
        // Hack: Browsers throttle 'display: none' videos. Use opacity 0 instead.
        this.videoElement.style.position = 'absolute';
        this.videoElement.style.top = '-9999px';
        this.videoElement.style.opacity = '0.001'; 
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
                        width: { ideal: 640 }, // Flexible width
                        height: { ideal: 480 }, // Flexible height
                        facingMode: 'user', // Front camera
                    },
                    audio: false,
                });
                this.videoElement.srcObject = this.stream;
                await new Promise((resolve) => {
                    this.videoElement.onloadedmetadata = () => {
                        this.videoElement.play().then(() => resolve(null));
                    };
                });
                eventBus.emit('camera_ready');
            } catch (error) {
                try {
                     // Fallback: Try without facingMode (any available camera)
                     this.stream = await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: false,  
                     });
                     this.videoElement.srcObject = this.stream;
                     await this.videoElement.play();
                     console.log('📸 CameraManager: Fallback stream active');
                     eventBus.emit('camera_ready');
                } catch (fallbackError) {
                     console.error('📸 CameraManager: All camera access failed', fallbackError);
                     if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                         console.error('🚨 Camera requires HTTPS on network addresses! Please use a secure connection.');
                         alert("Camera blocked! You must use HTTPS or localhost for camera access on mobile/network.");
                     }
                     throw fallbackError;
                }
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
