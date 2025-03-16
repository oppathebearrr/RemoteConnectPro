import { Request, Response } from "express";
import { storage } from "../storage";
import { insertUserSchema, insertWhiteLabelConfigSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    
    // In a real app, we would hash the password here
    // For demo purposes, we'll store it as is
    const user = await storage.createUser(userData);
    
    // Don't return the password in the response
    const { password, ...userWithoutPassword } = user;
    
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    
    console.error("Registration error:", error);
    res.status(500).json({ message: "Failed to register user" });
  }
};

// Log in a user
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    // In a real app, we would compare hashed passwords
    // For demo purposes, we'll compare plain text
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    // Store user ID in session
    req.session.userId = user.id;
    
    // Don't return the password in the response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ message: "Login successful", user: userWithoutPassword });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to login" });
  }
};

// Log out a user
export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Failed to logout" });
    }
    
    res.json({ message: "Logout successful" });
  });
};

// Get current logged in user
export const getCurrentUser = (req: Request, res: Response) => {
  // User is already available from the authenticate middleware
  res.json(req.user);
};

// Save white label configuration
export const saveWhiteLabelConfig = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const configData = insertWhiteLabelConfigSchema.parse({
      ...req.body,
      userId: req.user.id
    });
    
    // Check if user already has a config
    const existingConfig = await storage.getWhiteLabelConfigByUserId(req.user.id);
    
    let config;
    if (existingConfig) {
      // Update existing config
      config = await storage.updateWhiteLabelConfig(existingConfig.id, configData);
    } else {
      // Create new config
      config = await storage.createWhiteLabelConfig(configData);
    }
    
    res.json(config);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    
    console.error("White label config error:", error);
    res.status(500).json({ message: "Failed to save white label configuration" });
  }
};

// Get white label configuration
export const getWhiteLabelConfig = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const config = await storage.getWhiteLabelConfigByUserId(req.user.id);
    
    if (!config) {
      return res.status(404).json({ message: "White label configuration not found" });
    }
    
    res.json(config);
  } catch (error) {
    console.error("White label config error:", error);
    res.status(500).json({ message: "Failed to get white label configuration" });
  }
};
