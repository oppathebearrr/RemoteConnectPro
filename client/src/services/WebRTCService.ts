// Import webrtc-adapter first to ensure browser compatibility
import 'webrtc-adapter';

// Ensure polyfills are loaded
import '../polyfills';

// Import simple-peer as a module - use a dynamic import as a fallback if needed
import SimplePeer from 'simple-peer';

// Configure WebRTC
type SignalingDataHandler = (data: unknown) => void;
type MediaStreamHandler = (stream: MediaStream) => void;
type ConnectionStateHandler = (state: 'connecting' | 'connected' | 'disconnected' | 'failed') => void;
type ErrorHandler = (error: Error) => void;

export interface WebRTCOptions {
  onSignalingData?: SignalingDataHandler;
  onStream?: MediaStreamHandler;
  onConnectionState?: ConnectionStateHandler;
  onError?: ErrorHandler;
}

export class WebRTCService {
  private peer: any = null; // Using any to bypass TypeScript errors
  private stream: MediaStream | null = null;
  private options: WebRTCOptions;
  private connectionState: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'failed' = 'idle';

  constructor(options: WebRTCOptions = {}) {
    this.options = options;
  }

  /**
   * Initialize as WebRTC initiator (client-side)
   */
  public initializeAsInitiator(): void {
    try {
      // @ts-ignore - Ignore TypeScript errors for SimplePeer
      this.peer = new SimplePeer({
        initiator: true,
        trickle: true,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      this.setupPeerListeners();
      this.updateConnectionState('connecting');
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Initialize as WebRTC receiver (host-side)
   * @param stream - MediaStream from screen capture
   */
  public initializeAsReceiver(stream: MediaStream): void {
    try {
      this.stream = stream;
      
      // @ts-ignore - Ignore TypeScript errors for SimplePeer
      this.peer = new SimplePeer({
        initiator: false,
        trickle: true,
        stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      this.setupPeerListeners();
      this.updateConnectionState('connecting');
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Process signaling data received from the remote peer
   * @param data - Signaling data from the remote peer
   */
  public processSignalingData(data: unknown): void {
    if (!this.peer) {
      this.handleError(new Error('Peer connection not initialized'));
      return;
    }

    try {
      this.peer.signal(data);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Close and clean up the WebRTC connection
   */
  public disconnect(): void {
    if (this.peer) {
      try {
        this.peer.destroy();
        this.peer = null;
      } catch (error) {
        console.error('Error destroying peer connection:', error);
      }
    }

    if (this.stream) {
      try {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      } catch (error) {
        console.error('Error stopping media tracks:', error);
      }
    }

    this.updateConnectionState('disconnected');
  }

  /**
   * Set up event listeners for the WebRTC peer connection
   */
  private setupPeerListeners(): void {
    if (!this.peer) return;

    this.peer.on('signal', (data: unknown) => {
      if (this.options.onSignalingData) {
        this.options.onSignalingData(data);
      }
    });

    this.peer.on('connect', () => {
      this.updateConnectionState('connected');
    });

    this.peer.on('stream', (stream: MediaStream) => {
      if (this.options.onStream) {
        this.options.onStream(stream);
      }
    });

    this.peer.on('close', () => {
      this.updateConnectionState('disconnected');
    });

    this.peer.on('error', (err: Error) => {
      this.handleError(err);
      this.updateConnectionState('failed');
    });
  }

  /**
   * Update the connection state and notify listeners
   */
  private updateConnectionState(state: 'connecting' | 'connected' | 'disconnected' | 'failed'): void {
    this.connectionState = state;
    
    if (this.options.onConnectionState) {
      this.options.onConnectionState(state);
    }
  }

  /**
   * Handle WebRTC errors
   */
  private handleError(error: Error): void {
    console.error('WebRTC error:', error);
    
    if (this.options.onError) {
      this.options.onError(error);
    }
  }

  /**
   * Get the current connection state
   */
  public getConnectionState(): string {
    return this.connectionState;
  }

  /**
   * Send data through the WebRTC data channel
   */
  public sendData(data: unknown): boolean {
    if (!this.peer || !this.peer.connected) {
      return false;
    }

    try {
      this.peer.send(JSON.stringify(data));
      return true;
    } catch (error) {
      this.handleError(error as Error);
      return false;
    }
  }
}

// Singleton instance
let webRTCInstance: WebRTCService | null = null;

/**
 * Get or create a WebRTC service instance
 */
export const getWebRTCService = (options: WebRTCOptions = {}): WebRTCService => {
  if (!webRTCInstance) {
    webRTCInstance = new WebRTCService(options);
  } else {
    // Update options if provided
    webRTCInstance.disconnect();
    webRTCInstance = new WebRTCService(options);
  }
  
  return webRTCInstance;
};