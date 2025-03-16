/**
 * Screen Capture Service
 * 
 * This service provides methods to capture the screen, manage capture quality,
 * and handle screen sharing options like multi-monitor support.
 */

type CaptureErrorHandler = (error: Error) => void;
type CaptureStartHandler = (stream: MediaStream) => void;
type CaptureStopHandler = () => void;

// Define custom DisplayMediaStreamOptions that includes cursor property
// since TypeScript's default definition doesn't include it yet
interface EnhancedMediaTrackConstraints extends MediaTrackConstraints {
  cursor?: string;
}

interface EnhancedDisplayMediaStreamOptions extends DisplayMediaStreamOptions {
  video?: boolean | EnhancedMediaTrackConstraints;
}

export interface ScreenCaptureOptions {
  // Capture quality (1-100)
  quality?: number;
  
  // Frame rate options
  frameRate?: {
    ideal: number;
    max: number;
  };
  
  // Enable or disable cursor capture
  captureCursor?: boolean;
  
  // Crop region (if supported)
  cropTo?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  // Multi-monitor options
  monitorId?: string;
  
  // Event handlers
  onError?: CaptureErrorHandler;
  onStart?: CaptureStartHandler;
  onStop?: CaptureStopHandler;
}

export class ScreenCaptureService {
  private stream: MediaStream | null = null;
  private options: ScreenCaptureOptions;
  private isCapturing: boolean = false;
  private availableMonitors: Map<string, string> = new Map();
  
  constructor(options: ScreenCaptureOptions = {}) {
    this.options = {
      quality: 90,
      frameRate: {
        ideal: 15,
        max: 30
      },
      captureCursor: true,
      ...options
    };
  }
  
  /**
   * Start screen capture
   */
  public async startCapture(): Promise<MediaStream | null> {
    if (this.isCapturing) {
      return this.stream;
    }
    
    try {
      // Define screen capture options
      const displayMediaOptions: EnhancedDisplayMediaStreamOptions = {
        video: {
          frameRate: this.options.frameRate
        },
        audio: false
      };
      
      // Add cursor option if supported by browser
      if (this.options.captureCursor) {
        (displayMediaOptions.video as EnhancedMediaTrackConstraints).cursor = "always";
      }
      
      // Request screen capture
      this.stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      this.isCapturing = true;
      
      // Detect available monitors
      this.detectMonitors();
      
      // Set up track ended listener
      this.stream.getVideoTracks().forEach(track => {
        track.addEventListener('ended', () => this.stopCapture());
      });
      
      // Notify start
      if (this.options.onStart) {
        this.options.onStart(this.stream);
      }
      
      return this.stream;
    } catch (error) {
      this.handleError(error as Error);
      return null;
    }
  }
  
  /**
   * Stop screen capture
   */
  public stopCapture(): void {
    if (!this.isCapturing || !this.stream) {
      return;
    }
    
    try {
      // Stop all tracks
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      this.isCapturing = false;
      
      // Notify stop
      if (this.options.onStop) {
        this.options.onStop();
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  }
  
  /**
   * Get current capture status
   */
  public isActive(): boolean {
    return this.isCapturing;
  }
  
  /**
   * Get the current capture stream
   */
  public getStream(): MediaStream | null {
    return this.stream;
  }
  
  /**
   * Update capture options
   */
  public updateOptions(options: Partial<ScreenCaptureOptions>): void {
    this.options = {
      ...this.options,
      ...options
    };
    
    // If we're already capturing and certain options change,
    // we might need to restart the capture
    if (this.isCapturing && 
        (options.monitorId !== undefined || 
         options.captureCursor !== undefined)) {
      this.restartCapture();
    }
  }
  
  /**
   * Restart the current capture with new options
   */
  public async restartCapture(): Promise<MediaStream | null> {
    if (this.isCapturing) {
      this.stopCapture();
    }
    
    return this.startCapture();
  }
  
  /**
   * Detect available monitors/screens
   * 
   * Note: This is limited by browser support. The API doesn't provide
   * a standard way to enumerate displays, but we can try to detect them
   * when the user selects different sources during getDisplayMedia()
   */
  private detectMonitors(): void {
    if (!this.stream) return;
    
    this.stream.getVideoTracks().forEach(track => {
      const settings = track.getSettings();
      
      if (settings.deviceId) {
        this.availableMonitors.set(
          settings.deviceId,
          settings.displaySurface || 'unknown screen'
        );
      }
    });
  }
  
  /**
   * Get a list of available monitors/screens
   */
  public getAvailableMonitors(): Map<string, string> {
    return this.availableMonitors;
  }
  
  /**
   * Handle capture errors
   */
  private handleError(error: Error): void {
    console.error('Screen capture error:', error);
    
    if (this.options.onError) {
      this.options.onError(error);
    }
  }
  
  /**
   * Enable black screen mode (if supported by the OS)
   * This functionality might require OS-level APIs that are not
   * available in browser. This is a placeholder for native integration.
   */
  public enableBlackScreenMode(): boolean {
    // In a browser context, this might require a companion
    // native application or browser extension to actually work
    console.warn('Black screen mode not supported in browser context');
    return false;
  }
  
  /**
   * Disable black screen mode
   */
  public disableBlackScreenMode(): boolean {
    // See enableBlackScreenMode note
    return false;
  }
  
  /**
   * Capture a single frame from the current stream
   * @returns A base64-encoded JPEG image or null if capture failed
   */
  public async captureFrame(): Promise<string | null> {
    if (!this.isCapturing || !this.stream) {
      return null;
    }
    
    try {
      const videoTrack = this.stream.getVideoTracks()[0];
      if (!videoTrack) return null;
      
      // Use a video element and canvas instead of ImageCapture API
      // since ImageCapture may not be available in all browsers
      const video = document.createElement('video');
      video.srcObject = this.stream;
      video.muted = true;
      
      return new Promise<string | null>((resolve) => {
        video.onloadedmetadata = () => {
          video.play().then(() => {
            // Create a canvas and draw the frame
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            if (!context) {
              resolve(null);
              return;
            }
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Convert to JPEG with quality setting
            const imageData = canvas.toDataURL('image/jpeg', this.options.quality! / 100);
            
            // Clean up
            video.pause();
            video.srcObject = null;
            
            resolve(imageData.split(',')[1]);
          }).catch(err => {
            this.handleError(err);
            resolve(null);
          });
        };
        
        video.onerror = () => {
          this.handleError(new Error('Error playing video'));
          resolve(null);
        };
      });
      
    } catch (error) {
      this.handleError(error as Error);
      return null;
    }
  }
}

// Create singleton instance
let screenCaptureInstance: ScreenCaptureService | null = null;

/**
 * Get or create a screen capture service instance
 */
export const getScreenCaptureService = (options: ScreenCaptureOptions = {}): ScreenCaptureService => {
  if (!screenCaptureInstance) {
    screenCaptureInstance = new ScreenCaptureService(options);
  } else {
    // Update existing instance options
    screenCaptureInstance.updateOptions(options);
  }
  
  return screenCaptureInstance;
};