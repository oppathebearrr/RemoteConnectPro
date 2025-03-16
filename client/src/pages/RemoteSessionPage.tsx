import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useRemoteDesktop } from "@/hooks/useRemoteDesktop";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Loader2, Monitor, ArrowLeft, X, Maximize, Minimize, 
  Phone, MessageSquare, FileIcon, Settings 
} from "lucide-react";
import RemoteSessionScreen from "@/components/remote/RemoteSessionScreen";
import FileTransferPanel from "@/components/remote/FileTransferPanel";

const RemoteSessionPage = () => {
  const [location, setLocation] = useLocation();
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [screenData, setScreenData] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFileTransfer, setShowFileTransfer] = useState(false);
  const { toast } = useToast();
  
  const {
    connect,
    disconnect,
    isConnected,
    isConnecting,
    sendMouseEvent,
    sendKeyboardEvent,
    isUsingWebRTC,
    webRTCStream,
    lastFrame
  } = useRemoteDesktop({
    onConnected: () => {
      toast({
        title: "Connection established",
        description: "You are now connected to the remote desktop"
      });
    },
    onDisconnected: () => {
      toast({
        title: "Disconnected",
        description: "You have been disconnected from the remote desktop"
      });
      // Redirect back to client page
      setTimeout(() => setLocation("/client"), 3000);
    },
    onScreenUpdate: (imageData) => {
      setScreenData(imageData);
    },
    onError: (error) => {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Parse connection ID and password from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const pwd = params.get("password");
    
    if (id) {
      setConnectionId(id);
      if (pwd) {
        setPassword(pwd);
      }
    } else {
      // Redirect to client page if no connection ID
      setLocation("/client");
    }
  }, [setLocation]);
  
  // Auto-connect when component mounts
  useEffect(() => {
    const autoConnect = async () => {
      if (connectionId && !isConnected && !isConnecting) {
        try {
          await connect(connectionId, password || undefined);
        } catch (error) {
          console.error("Failed to connect:", error);
          toast({
            title: "Using demo mode",
            description: "Could not connect to a real remote session. Using demo mode instead.",
          });
          
          // Try again with demo mode
          try {
            await connect(connectionId, password || undefined);
          } catch (secondError) {
            console.error("Demo connection also failed:", secondError);
            toast({
              title: "Connection failed",
              description: "Could not establish connection. Returning to client page.",
              variant: "destructive"
            });
            // Redirect back to client page after a few seconds
            setTimeout(() => setLocation("/client"), 3000);
          }
        }
      }
    };
    
    autoConnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionId, password]);
  
  // Handle mouse events
  const handleMouseMove = (x: number, y: number) => {
    sendMouseEvent({ x, y, type: "move" });
  };
  
  const handleMouseDown = (x: number, y: number, button: number) => {
    sendMouseEvent({ x, y, type: "down", button });
  };
  
  const handleMouseUp = (x: number, y: number, button: number) => {
    sendMouseEvent({ x, y, type: "up", button });
  };
  
  // Handle keyboard events
  const handleKeyDown = (key: string, modifiers: string[]) => {
    sendKeyboardEvent({ key, type: "down", modifiers });
  };
  
  const handleKeyUp = (key: string, modifiers: string[]) => {
    sendKeyboardEvent({ key, type: "up", modifiers });
  };
  
  // Handle disconnect button click
  const handleDisconnect = () => {
    disconnect();
    setLocation("/client");
  };
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };
  
  return (
    <div className={`min-h-screen bg-neutral-900 flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {!isFullscreen && (
        <header className="bg-neutral-800 py-3 px-4 flex items-center justify-between text-white">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              className="mr-2 text-white hover:bg-neutral-700"
              onClick={() => setLocation("/client")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center">
              <Monitor className="h-5 w-5 mr-2" />
              <span className="font-medium">
                Remote Session {connectionId && `(${connectionId})`}
              </span>
              {isConnected && (
                <span className="ml-3 px-2 py-1 text-xs rounded-full bg-neutral-700">
                  {isUsingWebRTC ? 'WebRTC' : 'WebSocket'}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-neutral-700"
            >
              <Phone className="h-4 w-4 mr-2" />
              <span>Audio</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-neutral-700"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              <span>Chat</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className={`text-white hover:bg-neutral-700 ${showFileTransfer ? 'bg-neutral-700' : ''}`}
              onClick={() => setShowFileTransfer(!showFileTransfer)}
            >
              <FileIcon className="h-4 w-4 mr-2" />
              <span>Files</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-neutral-700"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </Button>
            
            <Button 
              variant="destructive" 
              size="icon"
              onClick={handleDisconnect}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </header>
      )}
      
      <main className="flex-1 flex items-center justify-center p-4 relative">
        {isConnecting && !isConnected && (
          <div className="absolute inset-0 bg-neutral-900/80 flex flex-col items-center justify-center z-10">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <h2 className="text-xl font-medium text-white mb-2">Connecting to remote desktop...</h2>
            <p className="text-neutral-400">This may take a few moments</p>
          </div>
        )}
        
        <RemoteSessionScreen 
          connectionId={connectionId || ""}
          screenData={screenData || undefined}
          videoStream={isUsingWebRTC ? webRTCStream || undefined : undefined}
          isConnected={isConnected}
          isLoading={isConnecting}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onDisconnect={handleDisconnect}
        />
      </main>
      
      {isFullscreen && (
        <div className="absolute top-4 right-4 z-20 flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="bg-neutral-800/80 text-white hover:bg-neutral-700"
            onClick={toggleFullscreen}
          >
            <Minimize className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="destructive" 
            size="icon"
            className="bg-red-500/80 hover:bg-red-600"
            onClick={handleDisconnect}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* File Transfer Panel */}
      <FileTransferPanel 
        isVisible={showFileTransfer && isConnected} 
        onClose={() => setShowFileTransfer(false)} 
        sessionId={connectionId || ''}
      />
    </div>
  );
};

export default RemoteSessionPage;