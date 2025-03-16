import { useEffect, useRef, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  MonitorIcon, 
  MouseIcon, 
  KeyboardIcon, 
  Settings2Icon, 
  AlertCircle,
  InfoIcon
} from "lucide-react";
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RemoteSessionScreenProps {
  connectionId: string;
  screenData?: string;
  videoStream?: MediaStream;
  isConnected: boolean;
  isLoading: boolean;
  onMouseMove?: (x: number, y: number) => void;
  onMouseDown?: (x: number, y: number, button: number) => void;
  onMouseUp?: (x: number, y: number, button: number) => void;
  onKeyDown?: (key: string, modifiers: string[]) => void;
  onKeyUp?: (key: string, modifiers: string[]) => void;
  onDisconnect?: () => void;
}

const RemoteSessionScreen = ({
  connectionId,
  screenData,
  videoStream,
  isConnected,
  isLoading,
  onMouseMove,
  onMouseDown,
  onMouseUp,
  onKeyDown,
  onKeyUp,
  onDisconnect
}: RemoteSessionScreenProps) => {
  const screenRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [screenScale, setScreenScale] = useState(1);
  const [screenWidth, setScreenWidth] = useState(0);
  const [screenHeight, setScreenHeight] = useState(0);
  const [usingWebRTC, setUsingWebRTC] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showDemoNotice, setShowDemoNotice] = useState(false);
  const [transportType, setTransportType] = useState<'webrtc' | 'websocket' | 'demo'>('websocket');
  const [frameRate, setFrameRate] = useState<number>(0);
  const [lastActivity, setLastActivity] = useState<string>('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  const frameCountRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const fpsIntervalRef = useRef<number | null>(null);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Setup FPS counter
  useEffect(() => {
    // Start calculating FPS
    const calculateFps = () => {
      const fps = frameCountRef.current;
      setFrameRate(fps);
      frameCountRef.current = 0;
    };
    
    fpsIntervalRef.current = window.setInterval(calculateFps, 1000);
    
    return () => {
      if (fpsIntervalRef.current) {
        clearInterval(fpsIntervalRef.current);
      }
    };
  }, []);
  
  // Detect if we're in demo mode
  useEffect(() => {
    // Check several indicators of demo mode
    const checkForDemoMode = () => {
      const isDemoSession = connectionId?.toLowerCase().includes('demo') || false;
      
      if (isDemoSession) {
        setIsDemoMode(true);
        setTransportType('demo');
        setShowDemoNotice(true);
        
        // Hide the demo notice after 10 seconds
        setTimeout(() => {
          setShowDemoNotice(false);
        }, 10000);
      }
    };
    
    checkForDemoMode();
  }, [connectionId, screenData]);
  
  // Handle video stream when using WebRTC
  useEffect(() => {
    if (videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream;
      setUsingWebRTC(true);
      setTransportType('webrtc');
      
      // Monitor video dimensions once loaded
      videoRef.current.onloadedmetadata = () => {
        if (videoRef.current) {
          setScreenWidth(videoRef.current.videoWidth);
          setScreenHeight(videoRef.current.videoHeight);
          
          // Calculate scale for responsive scaling
          if (screenRef.current) {
            const containerWidth = screenRef.current.clientWidth;
            if (videoRef.current.videoWidth > containerWidth) {
              setScreenScale(containerWidth / videoRef.current.videoWidth);
            } else {
              setScreenScale(1);
            }
          }
        }
      };
    } else if (!isDemoMode) {
      setUsingWebRTC(false);
      setTransportType('websocket');
    }
  }, [videoStream, isDemoMode]);
  
  // Update activity status and clear after delay
  const updateActivityStatus = useCallback((activity: string) => {
    setLastActivity(activity);
    
    // Clear activity status after 3 seconds
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    
    activityTimeoutRef.current = setTimeout(() => {
      setLastActivity('');
    }, 3000);
  }, []);
  
  // Set up keyboard event listeners
  useEffect(() => {
    if (!isConnected || !onKeyDown || !onKeyUp) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process key events when the remote screen is in focus
      if (!screenRef.current?.contains(document.activeElement) && 
          document.activeElement !== document.body) {
        return;
      }
      
      const modifiers = [];
      if (e.ctrlKey) modifiers.push("ctrl");
      if (e.altKey) modifiers.push("alt");
      if (e.shiftKey) modifiers.push("shift");
      if (e.metaKey) modifiers.push("meta");
      
      onKeyDown(e.key, modifiers);
      updateActivityStatus(`Key: ${e.key}${modifiers.length > 0 ? ' + ' + modifiers.join(' + ') : ''}`);
      e.preventDefault();
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      // Only process key events when the remote screen is in focus
      if (!screenRef.current?.contains(document.activeElement) && 
          document.activeElement !== document.body) {
        return;
      }
      
      const modifiers = [];
      if (e.ctrlKey) modifiers.push("ctrl");
      if (e.altKey) modifiers.push("alt");
      if (e.shiftKey) modifiers.push("shift");
      if (e.metaKey) modifiers.push("meta");
      
      onKeyUp(e.key, modifiers);
      e.preventDefault();
    };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isConnected, onKeyDown, onKeyUp, updateActivityStatus]);
  
  // Calculate screen dimensions and scale on image load (for non-WebRTC mode)
  useEffect(() => {
    if (!usingWebRTC && screenData && screenRef.current) {
      const img = new Image();
      img.onload = () => {
        setScreenWidth(img.width);
        setScreenHeight(img.height);
        
        // Calculate scale for responsive scaling
        if (screenRef.current) {
          const containerWidth = screenRef.current.clientWidth;
          if (img.width > containerWidth) {
            setScreenScale(containerWidth / img.width);
          } else {
            setScreenScale(1);
          }
        }
        
        // Increment frame counter for FPS calculation
        frameCountRef.current += 1;
          
        // Calculate time since last frame for framerate display
        const now = performance.now();
        if (lastFrameTimeRef.current > 0) {
          const timeDiff = now - lastFrameTimeRef.current;
          // Additional rendering could be done here based on frame timing
        }
        lastFrameTimeRef.current = now;
      };
      img.onerror = () => {
        setAlertMessage('Error loading screen image');
        setShowAlert(true);
      };
      img.src = `data:image/jpeg;base64,${screenData}`;
    }
  }, [screenData, usingWebRTC]);
  
  // Handle mouse events
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isConnected || !onMouseMove || !screenRef.current) return;
    
    const rect = screenRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / screenScale);
    const y = Math.round((e.clientY - rect.top) / screenScale);
    
    onMouseMove(x, y);
    // Don't update activity status on every mouse move to avoid flooding
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isConnected || !onMouseDown || !screenRef.current) return;
    
    const rect = screenRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / screenScale);
    const y = Math.round((e.clientY - rect.top) / screenScale);
    
    // Map button: 0 = left, 1 = middle, 2 = right
    onMouseDown(x, y, e.button);
    updateActivityStatus(`Click: ${e.button === 0 ? 'Left' : e.button === 1 ? 'Middle' : 'Right'} at (${x}, ${y})`);
    
    // Make sure we have focus for keyboard events
    screenRef.current.focus();
  };
  
  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isConnected || !onMouseUp || !screenRef.current) return;
    
    const rect = screenRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / screenScale);
    const y = Math.round((e.clientY - rect.top) / screenScale);
    
    onMouseUp(x, y, e.button);
  };
  
  // Prevent context menu on right-click
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      if (fpsIntervalRef.current) {
        clearInterval(fpsIntervalRef.current);
      }
    };
  }, []);
  
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      {showAlert && (
        <Alert variant="destructive" className="mb-4 w-full max-w-3xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}
      
      <Card 
        className={`relative max-w-full max-h-full overflow-hidden bg-black flex items-center justify-center ${isConnected ? 'cursor-none' : ''}`}
        style={{ 
          width: screenWidth > 0 ? `${screenWidth * screenScale}px` : '1024px',
          height: screenHeight > 0 ? `${screenHeight * screenScale}px` : '768px',
        }}
      >
        {isLoading && !screenData && !videoStream && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
            <span className="ml-2 text-white">Connecting to {connectionId}...</span>
          </div>
        )}
        
        {!isConnected && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <p className="text-lg">Not connected</p>
            <p className="text-sm text-neutral-400 mt-2">Connection ID: {connectionId || 'N/A'}</p>
          </div>
        )}
        
        <div 
          ref={screenRef}
          className="w-full h-full relative outline-none"
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onContextMenu={handleContextMenu}
          tabIndex={0} // Make the div focusable for keyboard events
        >
          {usingWebRTC && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: `scale(${screenScale})`,
                transformOrigin: 'top left'
              }}
            />
          )}
          
          {!usingWebRTC && screenData && (
            <img
              src={`data:image/jpeg;base64,${screenData}`}
              alt="Remote Screen"
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: `scale(${screenScale})`,
                transformOrigin: 'top left'
              }}
              draggable={false}
            />
          )}
        </div>
        
        {/* Status overlay with transport type, FPS, and activity indicators */}
        {isConnected && (
          <>
            {/* Connection type indicator */}
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                transportType === 'webrtc' ? 'bg-green-500' : 
                transportType === 'websocket' ? 'bg-yellow-500' : 
                'bg-blue-500'
              }`}></div>
              <MonitorIcon className="h-3 w-3" />
              <span>
                {transportType === 'webrtc' ? 'WebRTC' : 
                transportType === 'websocket' ? 'WebSocket' : 
                'Demo Mode'}
              </span>
              <span className="text-[10px] opacity-75">
                {frameRate > 0 && `${frameRate} FPS`}
              </span>
            </div>
            
            {/* Activity indicators */}
            {lastActivity && (
              <div className="absolute top-2 left-40 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-xs flex items-center">
                {lastActivity.includes('Key') ? (
                  <KeyboardIcon className="h-3 w-3 mr-1" />
                ) : (
                  <MouseIcon className="h-3 w-3 mr-1" />
                )}
                <span>{lastActivity}</span>
              </div>
            )}
            
            {/* Demo mode badge */}
            {isDemoMode && (
              <Badge 
                variant="outline" 
                className="absolute top-10 left-2 bg-yellow-500/80 text-black border-yellow-600"
              >
                Demo Mode
              </Badge>
            )}
            
            {/* Disconnect button */}
            <div className="absolute top-2 right-2 flex space-x-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={onDisconnect}
                className="bg-red-600 hover:bg-red-700"
              >
                Disconnect
              </Button>
            </div>
            
            {/* Controls & actions */}
            <div className="absolute bottom-2 left-2 flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-black/60 backdrop-blur-sm text-white border-gray-700 hover:bg-black/80"
                onClick={() => screenRef.current?.focus()}
              >
                <KeyboardIcon className="h-3 w-3 mr-1" />
                Focus
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="bg-black/60 backdrop-blur-sm text-white border-gray-700 hover:bg-black/80"
                disabled={!isDemoMode} // Only enable in demo mode
                onClick={() => setShowDemoNotice(prev => !prev)}
              >
                <InfoIcon className="h-3 w-3 mr-1" />
                Info
              </Button>
            </div>
            
            {/* Screen resolution indicator */}
            {screenWidth > 0 && (
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-xs">
                {screenWidth} × {screenHeight}
              </div>
            )}
          </>
        )}
      </Card>
      
      {/* Demo mode notice */}
      {isDemoMode && showDemoNotice && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md w-full max-w-3xl">
          <div className="flex items-start">
            <InfoIcon className="h-5 w-5 text-yellow-500 mt-0.5 mr-2" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">
                Demo Mode Active
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                You're currently viewing a simulated desktop environment. This demonstrates how the remote desktop would appear during an actual connection.
                Try moving your mouse and typing on your keyboard to interact with the demo.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemoteSessionScreen;

export default RemoteSessionScreen;