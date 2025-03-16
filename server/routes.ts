import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { authenticate } from "./middlewares/auth";
import * as userController from "./controllers/userController";
import * as connectionController from "./controllers/connectionController";

export async function registerRoutes(app: express.Application): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Create WebSocket server with a noServer option to handle upgrade manually
  const wss = new WebSocketServer({ noServer: true });
  
  // Handle upgrade events manually
  httpServer.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
    
    console.log('WebSocket upgrade request for path:', pathname);
    
    // Only handle WebSocket connections to /api/ws
    if (pathname === '/api/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        console.log('WebSocket upgrade successful for /api/ws');
        wss.emit('connection', ws, request);
      });
    } else {
      // Log other WebSocket connection attempts but don't destroy the socket
      // This allows Vite's HMR WebSockets to function
      console.log('Not handling WebSocket connection for path:', pathname);
    }
  });
  
  // Set up WebSocket connections
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Set up heartbeat
    const heartbeatInterval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    }, 30000);
    
    ws.on('message', (message) => {
      try {
        // Handle ping messages to keep the connection alive
        if (message.toString() === '{"type":"ping"}') {
          ws.send(JSON.stringify({ type: 'pong' }));
          return;
        }
        
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        switch (data.type) {
          case 'ping':
            // Respond to ping with pong
            ws.send(JSON.stringify({ type: 'pong' }));
            break;
          case 'connect':
            connectionController.handleConnectionRequest(ws, data.payload);
            break;
          case 'disconnect':
            connectionController.handleDisconnect(ws, data.payload);
            break;
          case 'mouse_event':
            connectionController.handleMouseEvent(ws, data.payload);
            break;
          case 'keyboard_event':
            connectionController.handleKeyboardEvent(ws, data.payload);
            break;
          case 'input_control':
            // Add input control handling
            break;
          case 'black_screen':
            // Add black screen handling
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      // Clear the heartbeat interval
      clearInterval(heartbeatInterval);
      // Clean up any active connections
      connectionController.handleClientDisconnect(ws);
    });
    
    // Send an initial connection acknowledgment
    ws.send(JSON.stringify({ 
      type: 'connection_acknowledgment',
      payload: { 
        status: 'connected',
        timestamp: new Date().toISOString()
      }
    }));
  });
  
  // API Routes
  const apiRouter = express.Router();
  
  // Health check endpoint
  apiRouter.get('/health', (req, res) => {
    res.json({ status: 'ok', server: 'running', time: new Date().toISOString() });
  });
  
  // WebSocket check endpoint
  apiRouter.get('/ws-check', (req, res) => {
    res.json({ 
      status: 'ok', 
      wsEndpoint: '/api/ws',
      message: 'WebSocket endpoint is available'
    });
  });
  
  // Auth routes
  apiRouter.post('/auth/register', userController.register);
  apiRouter.post('/auth/login', userController.login);
  apiRouter.post('/auth/logout', userController.logout);
  apiRouter.get('/auth/me', authenticate, userController.getCurrentUser);
  
  // Connection routes
  apiRouter.post('/connections', authenticate, connectionController.createConnection);
  apiRouter.get('/connections', authenticate, connectionController.getConnections);
  apiRouter.get('/connections/active', authenticate, connectionController.getActiveConnections);
  apiRouter.delete('/connections/:id', authenticate, connectionController.terminateConnection);
  
  // White label routes
  apiRouter.post('/white-label', authenticate, userController.saveWhiteLabelConfig);
  apiRouter.get('/white-label', authenticate, userController.getWhiteLabelConfig);
  
  // Add API router to app
  app.use('/api', apiRouter);
  
  return httpServer;
}
