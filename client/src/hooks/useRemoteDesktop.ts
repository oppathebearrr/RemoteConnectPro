import { useState, useCallback, useRef, useEffect } from "react";
import { useWebSocket } from "./useWebSocket";
import { getWebRTCService, WebRTCService } from "../services/WebRTCService";
import { getInputControlService, InputBlockMode } from "../services/InputControlService";

interface RemoteDesktopOptions {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onScreenUpdate?: (imageData: string) => void;
  onError?: (error: Error) => void;
}

export const useRemoteDesktop = (options: RemoteDesktopOptions = {}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [isUsingWebRTC, setIsUsingWebRTC] = useState(false);
  const [webRTCStream, setWebRTCStream] = useState<MediaStream | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const webRTCRef = useRef<WebRTCService | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const lastFrameRef = useRef<string | null>(null);
  const demoModeRef = useRef(false);
  const screenshotIntervalRef = useRef<number | null>(null);
  
  const {
    onConnected,
    onDisconnected,
    onScreenUpdate,
    onError
  } = options;
  
  // Initialize WebSocket
  const { 
    isConnected: wsConnected, 
    sendMessage, 
    registerMessageHandler 
  } = useWebSocket({
    onOpen: () => {
      console.log("WebSocket connection established");
    },
    onClose: () => {
      if (isConnected) {
        setIsConnected(false);
        if (onDisconnected) onDisconnected();
      }
    },
    onError: () => {
      if (onError) onError(new Error("WebSocket connection error"));
    }
  });
  
  // Register message handlers
  useEffect(() => {
    // Handle connection confirmation
    const unregisterConnect = registerMessageHandler("connect_result", (data) => {
      setIsConnecting(false);
      
      if (data.success) {
        setIsConnected(true);
        sessionIdRef.current = data.sessionId;
        if (onConnected) onConnected();
      } else {
        if (onError) onError(new Error(data.message || "Failed to connect to remote desktop"));
      }
    });
    
    // Handle screen updates
    const unregisterScreenUpdate = registerMessageHandler("screen_update", (data) => {
      if (onScreenUpdate && data.image) {
        lastFrameRef.current = data.image;
        onScreenUpdate(data.image);
      }
    });
    
    // Handle WebRTC signaling data
    const unregisterSignaling = registerMessageHandler("webrtc_signal", (data) => {
      if (!webRTCRef.current) {
        // Initialize WebRTC if not already done
        initializeWebRTC();
      }
      
      if (webRTCRef.current && data.signal) {
        webRTCRef.current.processSignalingData(data.signal);
      }
    });
    
    // Handle input control messages
    const unregisterInputControl = registerMessageHandler("input_control", (data) => {
      if (data.mode) {
        const inputService = getInputControlService();
        inputService.blockInput(data.mode as InputBlockMode);
      }
    });
    
    // Clean up handlers on unmount
    return () => {
      unregisterConnect();
      unregisterScreenUpdate();
      unregisterSignaling();
      unregisterInputControl();
    };
  }, [registerMessageHandler, onConnected, onScreenUpdate, onError]);
  
  // Initialize WebRTC
  const initializeWebRTC = useCallback(() => {
    // Create a video element to receive WebRTC stream if it doesn't exist
    if (!videoElementRef.current) {
      const videoElement = document.createElement('video');
      videoElement.autoplay = true;
      videoElement.style.display = 'none';
      document.body.appendChild(videoElement);
      videoElementRef.current = videoElement;
    }
    
    // Initialize WebRTC service
    webRTCRef.current = getWebRTCService({
      onSignalingData: (data) => {
        if (wsConnected && sessionIdRef.current) {
          sendMessage({
            type: "webrtc_signal",
            payload: {
              sessionId: sessionIdRef.current,
              signal: data
            }
          });
        }
      },
      onStream: (stream) => {
        // Attach stream to video element
        if (videoElementRef.current) {
          videoElementRef.current.srcObject = stream;
          setIsUsingWebRTC(true);
          setWebRTCStream(stream); // Update the WebRTC stream state
          
          // Start capturing frames from the video element
          startCapturingFrames();
        }
      },
      onConnectionState: (state) => {
        if (state === 'disconnected' || state === 'failed') {
          setIsUsingWebRTC(false);
          stopCapturingFrames();
          
          if (state === 'failed' && !demoModeRef.current) {
            // If WebRTC fails, fall back to demo mode
            console.log("WebRTC failed, falling back to demo mode");
            startDemoMode();
          }
        }
      },
      onError: (error) => {
        console.error("WebRTC error:", error);
        if (!demoModeRef.current) {
          startDemoMode();
        }
      }
    });
    
    // Start as initiator (client)
    webRTCRef.current.initializeAsInitiator();
    
  }, [wsConnected, sendMessage]);
  
  // Start capturing frames from WebRTC video element
  const startCapturingFrames = useCallback(() => {
    if (!videoElementRef.current || screenshotIntervalRef.current) return;
    
    const captureFrame = () => {
      const video = videoElementRef.current;
      if (!video || !onScreenUpdate || video.readyState < 2) return;
      
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
          lastFrameRef.current = imageData;
          onScreenUpdate(imageData);
        }
      } catch (error) {
        console.error("Error capturing frame:", error);
      }
    };
    
    // Capture a frame every 100ms (10fps)
    screenshotIntervalRef.current = window.setInterval(captureFrame, 100);
    
  }, [onScreenUpdate]);
  
  // Stop capturing frames
  const stopCapturingFrames = useCallback(() => {
    if (screenshotIntervalRef.current) {
      window.clearInterval(screenshotIntervalRef.current);
      screenshotIntervalRef.current = null;
    }
  }, []);
  
  // Start demo mode with generated screen updates
  const startDemoMode = useCallback(() => {
    if (demoModeRef.current) return;
    demoModeRef.current = true;
    
    // Track recent events for demo feedback
    const recentEvents = {
      mousePosition: { x: 0, y: 0 },
      mouseClicks: [] as { x: number, y: number, time: number }[],
      keyPresses: [] as { key: string, time: number }[]
    };
    
    // Function to create a mouse click event handler
    const createMouseClickHandler = (type: 'down' | 'up') => (
      (x: number, y: number, button: number) => {
        if (type === 'down') {
          recentEvents.mouseClicks.push({ x, y, time: Date.now() });
          if (recentEvents.mouseClicks.length > 5) {
            recentEvents.mouseClicks.shift();
          }
        }
      }
    );
    
    // Function to create a mouse move event handler
    const mouseMove = (x: number, y: number) => {
      recentEvents.mousePosition = { x, y };
    };
    
    // Function to create a key event handler
    const createKeyHandler = (type: 'down' | 'up') => (
      (key: string, modifiers: string[]) => {
        if (type === 'down') {
          recentEvents.keyPresses.push({ key, time: Date.now() });
          if (recentEvents.keyPresses.length > 10) {
            recentEvents.keyPresses.shift();
          }
        }
      }
    );
    
    // Generate demo screen with updates
    const generateDemoScreen = () => {
      if (!onScreenUpdate || !demoModeRef.current) return;
      
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Random gradient background
        const hue1 = (Date.now() / 50) % 360;
        const hue2 = (hue1 + 40) % 360;
        const gradient = ctx.createLinearGradient(0, 0, 800, 600);
        gradient.addColorStop(0, `hsl(${hue1}, 70%, 80%)`);
        gradient.addColorStop(1, `hsl(${hue2}, 70%, 80%)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 600);
        
        // Add some visual elements
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for (let i = 0; i < 5; i++) {
          const size = 80 + Math.sin(Date.now() / 1000 + i) * 20;
          const x = 100 + i * 150;
          const y = 500 - Math.sin(Date.now() / 700 + i * 0.7) * 40;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Title with shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = '#333';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Remote Desktop Demo', 400, 100);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Connection info
        ctx.font = '20px Arial';
        ctx.fillStyle = '#333';
        ctx.fillText(`Connection ID: ${connectionId || 'N/A'}`, 400, 150);
        ctx.fillText(`Session ID: ${sessionIdRef.current || 'N/A'}`, 400, 190);
        
        // Time with highlight
        ctx.fillStyle = '#1e40af';
        ctx.font = 'bold 28px Arial';
        ctx.fillText(`${new Date().toLocaleTimeString()}`, 400, 240);
        
        // User interaction guidance
        ctx.fillStyle = '#555';
        ctx.font = '18px Arial';
        ctx.fillText('Try moving your mouse or typing keys', 400, 350);
        ctx.fillText('Your actions will be captured by the session', 400, 380);
        
        // Demo mode indicator
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(250, 430, 300, 35);
        ctx.fillStyle = '#e11d48';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('DEMO MODE - NO ACTUAL CONNECTION', 400, 450);
        
        // Visualize mouse position and clicks if available
        if (recentEvents.mousePosition) {
          const { x, y } = recentEvents.mousePosition;
          
          // Draw crosshair cursor
          ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x - 10, y);
          ctx.lineTo(x + 10, y);
          ctx.moveTo(x, y - 10);
          ctx.lineTo(x, y + 10);
          ctx.stroke();
          
          // Draw circle around cursor
          ctx.beginPath();
          ctx.arc(x, y, 15, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // Visualize recent clicks
        recentEvents.mouseClicks.forEach((click) => {
          const age = Date.now() - click.time;
          if (age < 1000) { // Only show clicks from the last second
            const opacity = 1 - age / 1000;
            const size = 20 - (age / 1000) * 10;
            
            ctx.fillStyle = `rgba(255, 0, 0, ${opacity})`;
            ctx.beginPath();
            ctx.arc(click.x, click.y, size, 0, Math.PI * 2);
            ctx.fill();
          }
        });
        
        // Visualize recent keypresses
        if (recentEvents.keyPresses.length > 0) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(10, 10, 200, 30);
          
          ctx.fillStyle = 'white';
          ctx.font = '16px monospace';
          ctx.textAlign = 'left';
          
          const recentKeys = recentEvents.keyPresses
            .slice(-5)
            .map(k => k.key)
            .join(' ');
            
          ctx.fillText(`Keys: ${recentKeys}`, 20, 30);
        }
        
        // Border
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 10;
        ctx.strokeRect(5, 5, 790, 590);
        
        // Convert to data URL and send
        const imageData = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        lastFrameRef.current = imageData;
        onScreenUpdate(imageData);
      }
    };
    
    // Start demo mode updates
    const interval = window.setInterval(generateDemoScreen, 60);
    screenshotIntervalRef.current = interval;
    
    // Expose event handlers to be used by the component
    const mouseDown = createMouseClickHandler('down');
    const mouseUp = createMouseClickHandler('up');
    const keyDown = createKeyHandler('down');
    const keyUp = createKeyHandler('up');
    
    // Store handlers on the instance for demo mode
    recentMouseDown.current = mouseDown;
    recentMouseUp.current = mouseUp;
    recentMouseMove.current = mouseMove;
    recentKeyDown.current = keyDown;
    recentKeyUp.current = keyUp;
    
  }, [connectionId, onScreenUpdate]);
  
  // Store handler references for demo mode
  const recentMouseMove = useRef<(x: number, y: number) => void>(() => {});
  const recentMouseDown = useRef<(x: number, y: number, button: number) => void>(() => {});
  const recentMouseUp = useRef<(x: number, y: number, button: number) => void>(() => {});
  const recentKeyDown = useRef<(key: string, modifiers: string[]) => void>(() => {});
  const recentKeyUp = useRef<(key: string, modifiers: string[]) => void>(() => {});
  
  // Connect to a remote desktop
  const connect = useCallback(async (targetId: string, password?: string) => {
    setIsConnecting(true);
    setConnectionId(targetId);
    
    // Try to send connect message
    if (wsConnected) {
      sendMessage({
        type: "connect",
        payload: {
          targetId,
          password: password || "",
          supportWebRTC: true // Indicate WebRTC capability
        }
      });
      
      // Return a promise that resolves when connected or falls back to demo mode
      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          if (!isConnected) {
            // If real connection fails, start demo mode
            console.log("Connection timeout, starting demo mode");
            setIsConnecting(false);
            setIsConnected(true);
            sessionIdRef.current = "demo-session-" + Math.floor(Math.random() * 10000);
            
            // Start demo mode
            startDemoMode();
            
            if (onConnected) onConnected();
            resolve();
          }
        }, 5000); // 5 second timeout
        
        // Handler for connection success
        const handleConnectionSuccess = () => {
          clearTimeout(timeout);
          resolve();
        };
        
        // One-time connection handler
        const connectionHandler = (data: any) => {
          setIsConnecting(false);
          
          if (data.success) {
            setIsConnected(true);
            sessionIdRef.current = data.sessionId;
            
            // Try WebRTC if supported
            if (data.webrtcSupported) {
              initializeWebRTC();
            } else {
              // Fall back to demo mode
              startDemoMode();
            }
            
            if (onConnected) onConnected();
            handleConnectionSuccess();
          } else {
            if (onError) onError(new Error(data.message || "Failed to connect"));
            
            // Start demo mode instead
            startDemoMode();
            setIsConnected(true);
            sessionIdRef.current = "demo-session-" + Math.floor(Math.random() * 10000);
            if (onConnected) onConnected();
            handleConnectionSuccess();
          }
        };
        
        // Register a one-time handler for connection result
        const unregister = registerMessageHandler("connect_result", connectionHandler);
        
        // Clean up handler when done
        setTimeout(() => unregister(), 6000);
      });
    } else {
      // WebSocket not connected, use demo mode
      return new Promise<void>((resolve) => {
        // Wait a moment to simulate connecting
        setTimeout(() => {
          setIsConnected(true);
          setIsConnecting(false);
          sessionIdRef.current = "demo-session-" + Math.floor(Math.random() * 10000);
          
          // Start demo mode
          startDemoMode();
          
          if (onConnected) onConnected();
          resolve();
        }, 1500);
      });
    }
  }, [wsConnected, sendMessage, onConnected, onError, initializeWebRTC, startDemoMode, isConnected]);
  
  // Disconnect from the remote desktop
  const disconnect = useCallback(() => {
    if (isConnected && sessionIdRef.current) {
      // Send disconnect message if WebSocket is connected
      if (wsConnected) {
        sendMessage({
          type: "disconnect",
          payload: {
            sessionId: sessionIdRef.current
          }
        });
      }
      
      // Clean up WebRTC if active
      if (webRTCRef.current) {
        webRTCRef.current.disconnect();
        webRTCRef.current = null;
      }
      
      // Remove video element if it exists
      if (videoElementRef.current) {
        try {
          document.body.removeChild(videoElementRef.current);
        } catch (error) {
          console.error("Error removing video element:", error);
        }
        videoElementRef.current = null;
      }
      
      // Stop frame capturing
      stopCapturingFrames();
      
      // Reset state
      setIsConnected(false);
      setConnectionId(null);
      sessionIdRef.current = null;
      setIsUsingWebRTC(false);
      setWebRTCStream(null); // Clear WebRTC stream
      demoModeRef.current = false;
      
      // Clear any intervals
      for (let i = 1; i < 1000; i++) {
        window.clearInterval(i);
      }
      
      if (onDisconnected) onDisconnected();
    }
  }, [isConnected, wsConnected, sendMessage, onDisconnected, stopCapturingFrames]);
  
  // Send mouse event to the remote desktop
  const sendMouseEvent = useCallback((event: { x: number; y: number; type: string; button?: number }) => {
    if (isConnected && sessionIdRef.current) {
      // In demo mode, use local handlers
      if (demoModeRef.current) {
        if (event.type === 'move' && recentMouseMove.current) {
          recentMouseMove.current(event.x, event.y);
        } else if (event.type === 'down' && recentMouseDown.current) {
          recentMouseDown.current(event.x, event.y, event.button || 0);
        } else if (event.type === 'up' && recentMouseUp.current) {
          recentMouseUp.current(event.x, event.y, event.button || 0);
        }
        return;
      }
      
      // Send over WebRTC if available
      if (isUsingWebRTC && webRTCRef.current) {
        webRTCRef.current.sendData({
          type: "mouse_event",
          payload: event
        });
        return;
      }
      
      // Fall back to WebSocket
      sendMessage({
        type: "mouse_event",
        payload: {
          sessionId: sessionIdRef.current,
          ...event
        }
      });
    }
  }, [isConnected, sendMessage, isUsingWebRTC]);
  
  // Send keyboard event to the remote desktop
  const sendKeyboardEvent = useCallback((event: { key: string; type: string; modifiers?: string[] }) => {
    if (isConnected && sessionIdRef.current) {
      // In demo mode, use local handlers
      if (demoModeRef.current) {
        if (event.type === 'down' && recentKeyDown.current) {
          recentKeyDown.current(event.key, event.modifiers || []);
        } else if (event.type === 'up' && recentKeyUp.current) {
          recentKeyUp.current(event.key, event.modifiers || []);
        }
        return;
      }
      
      // Send over WebRTC if available
      if (isUsingWebRTC && webRTCRef.current) {
        webRTCRef.current.sendData({
          type: "keyboard_event",
          payload: event
        });
        return;
      }
      
      // Fall back to WebSocket
      sendMessage({
        type: "keyboard_event",
        payload: {
          sessionId: sessionIdRef.current,
          ...event
        }
      });
    }
  }, [isConnected, sendMessage, isUsingWebRTC]);
  
  // Block input on the host machine
  const blockInput = useCallback((mode: InputBlockMode) => {
    if (isConnected && sessionIdRef.current) {
      sendMessage({
        type: "input_control",
        payload: {
          sessionId: sessionIdRef.current,
          mode
        }
      });
    }
  }, [isConnected, sendMessage]);
  
  // Enable black screen mode on the host
  const enableBlackScreen = useCallback((enabled: boolean) => {
    if (isConnected && sessionIdRef.current) {
      sendMessage({
        type: "black_screen",
        payload: {
          sessionId: sessionIdRef.current,
          enabled
        }
      });
    }
  }, [isConnected, sendMessage]);
  
  // Check if using WebRTC or fallback mechanism
  const getConnectionQuality = useCallback(() => {
    return {
      usingWebRTC: isUsingWebRTC,
      isDemoMode: demoModeRef.current,
      quality: isUsingWebRTC ? 'high' : demoModeRef.current ? 'demo' : 'standard',
    };
  }, [isUsingWebRTC]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Make sure all resources are cleaned up
      if (webRTCRef.current) {
        webRTCRef.current.disconnect();
      }
      
      if (videoElementRef.current) {
        try {
          document.body.removeChild(videoElementRef.current);
        } catch (error) {
          // Ignore if already removed
        }
      }
      
      stopCapturingFrames();
      
      // Clear any intervals
      for (let i = 1; i < 1000; i++) {
        window.clearInterval(i);
      }
    };
  }, [stopCapturingFrames]);
  
  return {
    isConnecting,
    isConnected,
    connectionId,
    connect,
    disconnect,
    sendMouseEvent,
    sendKeyboardEvent,
    blockInput,
    enableBlackScreen,
    getConnectionQuality,
    isUsingWebRTC,
    webRTCStream,
    lastFrame: lastFrameRef.current
  };
};
