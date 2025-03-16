import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        isAdmin: boolean;
      };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  // In a real application, this would verify a JWT token or session
  // For this example, we'll use a simple userId in the session
  const userId = req.session?.userId;
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }
  
  try {
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }
    
    // Add user info to request object
    req.user = {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    };
    
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  
  next();
};
