import { WebSocket } from "ws";
import { Request, Response } from "express";
import { storage } from "../storage";
import { Connection, InsertConnection } from "../../shared/schema";
import * as screenController from "./screenController";
import crypto from "crypto";
import { fileURLToPath } from 'url';
import path from 'path';

// Get directory name equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keep track of active connections
interface ActiveConnection {
  ws: WebSocket;
  userId: number;
  connectionId: string;
  sessionId?: string;
}

const activeConnections = new Map<string, ActiveConnection>();

// Handle connection request from client to host
export const handleConnectionRequest = async (ws: WebSocket, payload: any) => {
  const { targetId, password } = payload;
  
  if (!targetId) {
    ws.send(JSON.stringify({
      type: "connect_result", 
      payload: { 
        success: false, 
        message: "Invalid connection ID" 
      }
    }));
    return;
  }
  
  try {
    // Get the connection by ID
    const connection = await storage.getConnectionByConnectionId(targetId);
    
    if (!connection) {
      ws.send(JSON.stringify({
        type: "connect_result", 
        payload: { 
          success: false, 
          message: "Connection not found" 
        }
      }));
      return;
    }
    
    // Verify the password if set
    if (connection.password && connection.password !== password) {
      ws.send(JSON.stringify({
        type: "connect_result", 
        payload: { 
          success: false, 
          message: "Invalid password" 
        }
      }));
      return;
    }
    
    // Find the host connection
    const hostConnection = Array.from(activeConnections.values())
      .find(c => c.connectionId === targetId);
    
    if (!hostConnection) {
      ws.send(JSON.stringify({
        type: "connect_result", 
        payload: { 
          success: false, 
          message: "Host is not connected" 
        }
      }));
      return;
    }
    
    // Create a screen sharing session
    const sessionId = screenController.createScreenSession(targetId, hostConnection.ws);
    
    // Join the screen session
    const joined = screenController.joinScreenSession(sessionId, ws);
    
    if (!joined) {
      ws.send(JSON.stringify({
        type: "connect_result", 
        payload: { 
          success: false, 
          message: "Failed to join session" 
        }
      }));
      return;
    }
    
    // Start demo screen updates (in a real app, the host would send the updates)
    screenController.startDemoScreenUpdates(sessionId);
    
    // Send success response to client
    ws.send(JSON.stringify({
      type: "connect_result", 
      payload: { 
        success: true, 
        sessionId, 
        connectionId: targetId
      }
    }));
    
    console.log(`Client connected to host ${targetId} with session ${sessionId}`);
  } catch (error) {
    console.error("Connection error:", error);
    ws.send(JSON.stringify({
      type: "connect_result", 
      payload: { 
        success: false, 
        message: "Internal server error" 
      }
    }));
  }
};

// Handle disconnect
export const handleDisconnect = (ws: WebSocket, payload: any) => {
  const { sessionId } = payload;
  
  if (sessionId) {
    screenController.closeScreenSession(sessionId);
  }
  
  // Close any sessions associated with this connection
  activeConnections.forEach((connection, id) => {
    if (connection.ws === ws) {
      if (connection.sessionId) {
        screenController.closeScreenSession(connection.sessionId);
      }
      activeConnections.delete(id);
    }
  });
};

// Handle client disconnect
export const handleClientDisconnect = (ws: WebSocket) => {
  // Close any sessions associated with this connection
  activeConnections.forEach((connection, id) => {
    if (connection.ws === ws) {
      if (connection.sessionId) {
        screenController.closeScreenSession(connection.sessionId);
      }
      activeConnections.delete(id);
    }
  });
};

// Handle mouse events
export const handleMouseEvent = (ws: WebSocket, payload: any) => {
  const { sessionId, x, y, type, button } = payload;
  
  if (!sessionId || !type) {
    return;
  }
  
  screenController.handleRemoteMouseEvent(sessionId, { x, y, type, button });
};

// Handle keyboard events
export const handleKeyboardEvent = (ws: WebSocket, payload: any) => {
  const { sessionId, key, type, modifiers } = payload;
  
  if (!sessionId || !key || !type) {
    return;
  }
  
  screenController.handleRemoteKeyboardEvent(sessionId, { key, type, modifiers });
};

// API Routes for Connection Management

// Create a new connection
export const createConnection = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Generate unique connection ID
    const connectionId = crypto.randomBytes(4).toString("hex");
    
    const connection: InsertConnection = {
      userId,
      connectionId,
      name: req.body.name || "New Connection",
      active: true,
      password: req.body.password || null,
      settings: req.body.settings || {}
    };
    
    const newConnection = await storage.createConnection(connection);
    
    res.status(201).json(newConnection);
  } catch (error) {
    console.error("Failed to create connection:", error);
    res.status(500).json({ error: "Failed to create connection" });
  }
};

// Get user's connections
export const getConnections = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const connections = await storage.getConnectionsByUserId(userId);
    
    res.json(connections);
  } catch (error) {
    console.error("Failed to get connections:", error);
    res.status(500).json({ error: "Failed to get connections" });
  }
};

// Get active connections
export const getActiveConnections = async (req: Request, res: Response) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const connections = await storage.getActiveConnections();
    
    res.json(connections);
  } catch (error) {
    console.error("Failed to get active connections:", error);
    res.status(500).json({ error: "Failed to get active connections" });
  }
};

// Terminate a connection
export const terminateConnection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Get the connection
    const connection = await storage.getConnection(parseInt(id));
    
    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }
    
    // Check if user owns this connection or is an admin
    if (connection.userId !== userId && !req.user?.isAdmin) {
      return res.status(403).json({ error: "Permission denied" });
    }
    
    // Deactivate the connection
    const updatedConnection = await storage.updateConnectionStatus(parseInt(id), false);
    
    // Close any active screen sessions for this connection
    activeConnections.forEach((conn, connectionId) => {
      if (conn.connectionId === connection.connectionId && conn.sessionId) {
        screenController.closeScreenSession(conn.sessionId);
        activeConnections.delete(connectionId);
      }
    });
    
    res.json(updatedConnection);
  } catch (error) {
    console.error("Failed to terminate connection:", error);
    res.status(500).json({ error: "Failed to terminate connection" });
  }
};