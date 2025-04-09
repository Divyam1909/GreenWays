import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// JWT secret key - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'greenways-secret-key';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Missing or invalid Authorization header');
      res.status(401).json({ message: 'Access denied. No token provided.' });
      return;
    }
    
    // Extract token 
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log('No token provided');
      res.status(401).json({ message: 'Access denied. No token provided.' });
      return;
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      
      // Attach user to request
      req.user = { id: decoded.id };
      
      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.log('Invalid token:', error);
      res.status(401).json({ message: 'Invalid token. Please authenticate again.' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error during authentication.' });
  }
};

export default authenticate; 