import { useState, useEffect, useCallback, useRef } from "react";

type MessageHandler = (data: any) => void;

interface UseWebSocketOptions {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnectOnClose?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  pingInterval?: number; // Add support for ping/pong to keep connection alive
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const messageHandlersRef = useRef<Record<string, MessageHandler>>({});
  const pingIntervalRef = useRef<number | null>(null);
  const manualDisconnectRef = useRef(false); // Track if disconnect was manually triggered
  
  const {
    onOpen,
    onClose,
    onError,
    reconnectOnClose = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    pingInterval = 30000 // Default ping every 30 seconds
  } = options;

  // Ping function to keep connection alive
  const ping = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "ping" }));
    }
  }, []);

  const connect = useCallback(() => {
    // Don't try to reconnect if we're already connected
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    // Reset manual disconnect flag
    manualDisconnectRef.current = false;

    // Create WebSocket connection using the correct protocol
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // Match the server's WebSocket upgrade path (/api/ws)
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;
    
    console.log("Connecting to WebSocket:", wsUrl);
    socketRef.current = new WebSocket(wsUrl);
    
    socketRef.current.onopen = () => {
      console.log('✅ WebSocket connection opened successfully');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      
      // Set up ping interval to keep connection alive
      if (pingIntervalRef.current) {
        window.clearInterval(pingIntervalRef.current);
      }
      pingIntervalRef.current = window.setInterval(ping, pingInterval);
      
      if (onOpen) onOpen();
    };
    
    socketRef.current.onclose = (event) => {
      console.log(`❌ WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
      setIsConnected(false);
      
      // Clear ping interval
      if (pingIntervalRef.current) {
        window.clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      
      if (onClose) onClose();
      
      // Only reconnect if not manually disconnected and reconnection is enabled
      if (!manualDisconnectRef.current && reconnectOnClose && reconnectAttemptsRef.current < maxReconnectAttempts) {
        console.log(`🔄 Attempting to reconnect (${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})...`);
        reconnectAttemptsRef.current += 1;
        
        // Use increasing backoff time
        const backoffTime = reconnectInterval * Math.pow(1.5, reconnectAttemptsRef.current - 1);
        setTimeout(connect, backoffTime);
      } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.log('❌ Maximum reconnection attempts reached');
      }
    };
    
    socketRef.current.onerror = (error) => {
      console.error('⚠️ WebSocket error:', error);
      // Don't call disconnect here, let the onclose handler manage reconnection
      if (onError) onError(error);
    };
    
    socketRef.current.onmessage = (event) => {
      try {
        // Handle pong response from server
        if (event.data === 'pong' || event.data === '{"type":"pong"}') {
          console.log('Received pong from server');
          return;
        }
        
        const data = JSON.parse(event.data);
        setLastMessage(data);
        
        // Handle messages based on their type
        if (data.type && messageHandlersRef.current[data.type]) {
          messageHandlersRef.current[data.type](data.payload || data);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
  }, [onOpen, onClose, onError, reconnectOnClose, reconnectInterval, maxReconnectAttempts, ping, pingInterval]);
  
  const disconnect = useCallback(() => {
    manualDisconnectRef.current = true; // Mark as manual disconnect
    
    // Clear ping interval
    if (pingIntervalRef.current) {
      window.clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);
  
  const sendMessage = useCallback((data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);
  
  const registerMessageHandler = useCallback((type: string, handler: MessageHandler) => {
    messageHandlersRef.current[type] = handler;
    
    // Return a function to unregister the handler
    return () => {
      delete messageHandlersRef.current[type];
    };
  }, []);
  
  // Connect when the component mounts
  useEffect(() => {
    connect();
    
    // Clean up WebSocket connection when the component unmounts
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);
  
  return {
    isConnected,
    lastMessage,
    sendMessage,
    registerMessageHandler,
    connect,
    disconnect
  };
};
