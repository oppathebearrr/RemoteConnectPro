import { WebSocket } from "ws";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from 'url';

// Get directory name equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store screen sharing sessions
type ScreenSession = {
  id: string;
  connectionId: string;
  clientWs: WebSocket | null;
  hostWs: WebSocket | null;
  lastUpdated: number;
  width: number;
  height: number;
  active: boolean;
};

const screenSessions = new Map<string, ScreenSession>();

// Simulate screen captures (in a real app, this would capture from the host machine)
const SAMPLE_SCREENS_DIR = path.join(__dirname, "../../sample-screens");
const sampleScreens: string[] = [];

try {
  // Initialize with demo screen data if available (for testing purposes)
  if (fs.existsSync(SAMPLE_SCREENS_DIR)) {
    const files = fs.readdirSync(SAMPLE_SCREENS_DIR)
      .filter(file => file.endsWith('.jpg') || file.endsWith('.png'));
    
    for (const file of files) {
      const data = fs.readFileSync(path.join(SAMPLE_SCREENS_DIR, file));
      sampleScreens.push(data.toString('base64'));
    }
  }
} catch (error) {
  console.log("No sample screens available for demo");
}

// Create a new screen sharing session
export const createScreenSession = (connectionId: string, hostWs: WebSocket): string => {
  const sessionId = crypto.randomUUID();
  
  screenSessions.set(sessionId, {
    id: sessionId,
    connectionId,
    clientWs: null,
    hostWs,
    lastUpdated: Date.now(),
    width: 1024,
    height: 768,
    active: true
  });
  
  console.log(`New screen session created: ${sessionId} for connection ${connectionId}`);
  return sessionId;
};

// Join a screen sharing session
export const joinScreenSession = (sessionId: string, clientWs: WebSocket): boolean => {
  const session = screenSessions.get(sessionId);
  
  if (!session) {
    return false;
  }
  
  session.clientWs = clientWs;
  session.lastUpdated = Date.now();
  
  console.log(`Client joined screen session: ${sessionId}`);
  
  // Notify host that client has joined
  if (session.hostWs && session.hostWs.readyState === WebSocket.OPEN) {
    session.hostWs.send(JSON.stringify({
      type: "client_joined",
      payload: {
        sessionId
      }
    }));
  }
  
  return true;
};

// Send screen update
export const sendScreenUpdate = (sessionId: string, imageData: string) => {
  const session = screenSessions.get(sessionId);
  
  if (!session || !session.clientWs || session.clientWs.readyState !== WebSocket.OPEN) {
    return false;
  }
  
  session.clientWs.send(JSON.stringify({
    type: "screen_update",
    payload: {
      sessionId,
      image: imageData
    }
  }));
  
  session.lastUpdated = Date.now();
  return true;
};

// Handle mouse event
export const handleRemoteMouseEvent = (sessionId: string, event: any) => {
  const session = screenSessions.get(sessionId);
  
  if (!session || !session.hostWs || session.hostWs.readyState !== WebSocket.OPEN) {
    return false;
  }
  
  session.hostWs.send(JSON.stringify({
    type: "mouse_event",
    payload: {
      sessionId,
      ...event
    }
  }));
  
  return true;
};

// Handle keyboard event
export const handleRemoteKeyboardEvent = (sessionId: string, event: any) => {
  const session = screenSessions.get(sessionId);
  
  if (!session || !session.hostWs || session.hostWs.readyState !== WebSocket.OPEN) {
    return false;
  }
  
  session.hostWs.send(JSON.stringify({
    type: "keyboard_event",
    payload: {
      sessionId,
      ...event
    }
  }));
  
  return true;
};

// Close a screen sharing session
export const closeScreenSession = (sessionId: string) => {
  const session = screenSessions.get(sessionId);
  
  if (!session) {
    return false;
  }
  
  // Notify both client and host
  if (session.clientWs && session.clientWs.readyState === WebSocket.OPEN) {
    session.clientWs.send(JSON.stringify({
      type: "session_closed",
      payload: {
        sessionId,
        reason: "Session closed by host"
      }
    }));
  }
  
  if (session.hostWs && session.hostWs.readyState === WebSocket.OPEN) {
    session.hostWs.send(JSON.stringify({
      type: "session_closed",
      payload: {
        sessionId,
        reason: "Session closed"
      }
    }));
  }
  
  screenSessions.delete(sessionId);
  console.log(`Screen session closed: ${sessionId}`);
  
  return true;
};

// Send demo screen updates (for testing)
export const startDemoScreenUpdates = (sessionId: string) => {
  const session = screenSessions.get(sessionId);
  
  if (!session || !session.clientWs) {
    return false;
  }
  
  console.log(`Starting demo screen updates for session: ${sessionId}`);
  
  // Create mock desktop environment for demo sessions
  const mockDesktopElements = [
    { type: 'window', id: 'window-1', title: 'File Explorer', x: 50, y: 50, width: 800, height: 600, active: true },
    { type: 'window', id: 'window-2', title: 'Browser', x: 150, y: 150, width: 900, height: 700, active: false },
    { type: 'window', id: 'window-3', title: 'Terminal', x: 250, y: 250, width: 600, height: 400, active: false },
    { type: 'icon', id: 'icon-1', title: 'Documents', x: 20, y: 20 },
    { type: 'icon', id: 'icon-2', title: 'Downloads', x: 20, y: 80 },
    { type: 'icon', id: 'icon-3', title: 'Pictures', x: 20, y: 140 },
    { type: 'taskbar', items: ['File Explorer', 'Browser', 'Terminal', 'Settings'] }
  ];
  
  // Send initial desktop environment
  session.clientWs.send(JSON.stringify({
    type: "demo_desktop_init",
    payload: {
      sessionId,
      timestamp: Date.now(),
      mockDesktop: mockDesktopElements,
      resolution: { width: 1920, height: 1080 }
    }
  }));
  
  // Function to send a screen update
  const sendDemoUpdate = () => {
    if (!screenSessions.has(sessionId)) return;
    
    const session = screenSessions.get(sessionId)!;
    if (!session.active || !session.clientWs || session.clientWs.readyState !== WebSocket.OPEN) {
      return;
    }
    
    if (sampleScreens.length > 0) {
      // Use sample screens if available
      const randomIndex = Math.floor(Math.random() * sampleScreens.length);
      const imageData = sampleScreens[randomIndex];
      
      // Send screen update
      sendScreenUpdate(sessionId, imageData);
    } else {
      // Generate a simulated screen with UI elements if no sample screens
      const generateDemoScreen = () => {
        // Create a base64 representation of a simulated desktop
        // For demo purposes, we'll send a JSON description instead
        const simulatedDesktop = {
          background: '#1e90ff',
          windows: [
            { id: 'win1', title: 'File Explorer', active: Math.random() > 0.5, x: 100, y: 100 },
            { id: 'win2', title: 'Web Browser', active: Math.random() > 0.7, x: 300, y: 150 },
            { id: 'win3', title: 'Terminal', active: Math.random() > 0.8, x: 200, y: 200 }
          ],
          cursorPosition: {
            x: Math.floor(Math.random() * 1000),
            y: Math.floor(Math.random() * 800)
          },
          notifications: Math.random() > 0.8 ? [
            { id: 'notif1', title: 'System Update', message: 'Updates are available' }
          ] : []
        };
        
        // Send it as a demo screen
        session.clientWs?.send(JSON.stringify({
          type: "screen_update",
          payload: {
            sessionId,
            timestamp: Date.now(),
            demoMode: true,
            simulatedDesktop,
            message: "Demo Mode - Interactive mockup of remote desktop"
          }
        }));
      };
      
      generateDemoScreen();
    }
    
    // Simulate desktop interactions
    if (Math.random() > 0.7) {
      // Simulate mouse movements and clicks
      const mouseEvent = {
        type: Math.random() > 0.7 ? 'click' : 'move',
        x: Math.floor(Math.random() * 1000),
        y: Math.floor(Math.random() * 800),
        button: Math.floor(Math.random() * 3)
      };
      
      session.clientWs.send(JSON.stringify({
        type: "demo_interaction",
        payload: {
          sessionId,
          timestamp: Date.now(),
          event: mouseEvent
        }
      }));
    }
    
    // Schedule the next update (variable timing for more realistic effect)
    const nextUpdateTime = 1000 + Math.floor(Math.random() * 1000);
    setTimeout(sendDemoUpdate, nextUpdateTime);
  };
  
  // Start sending updates
  sendDemoUpdate();
  
  return true;
};

// Cleanup inactive sessions (called periodically)
export const cleanupInactiveSessions = () => {
  const now = Date.now();
  const inactivityThreshold = 5 * 60 * 1000; // 5 minutes
  
  // Convert to array to iterate without downlevelIteration
  Array.from(screenSessions.entries()).forEach(([sessionId, session]) => {
    if (now - session.lastUpdated > inactivityThreshold) {
      closeScreenSession(sessionId);
    }
  });
};

// Setup periodic cleanup
setInterval(cleanupInactiveSessions, 60 * 1000); // Run every minute