import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { rlsContext } from '../db/prisma';
import { config } from '../config/env';

// Extend the Express Request type to attach user session data safely
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: 'CUSTOMER' | 'TRANSPORTER' | 'ADMIN';
        phoneNumber?: string;
        email?: string;
      };
    }
  }
}

interface TokenPayload {
  userId: string;
  role: 'CUSTOMER' | 'TRANSPORTER' | 'ADMIN';
  phoneNumber?: string;
  email?: string;
}

// 1. Verify Authentication Token Middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Pull token from the standard Authorization header
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];

  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }
  if (!token && req.cookies?.admin_token) {
    token = req.cookies.admin_token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Security authentication token missing.' });
  }

  try {
    let decoded: any;
    decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;
    
    // Map legacy 'SHIPPER' role to 'CUSTOMER'
    let effectiveRole = decoded.role || 'CUSTOMER';
    if (effectiveRole === 'SHIPPER') effectiveRole = 'CUSTOMER';

    // Attach user session properties to the request object safely
    req.user = {
      id: decoded.sub || decoded.userId || decoded.adminId || decoded.id,
      role: effectiveRole,
      phoneNumber: decoded.phoneNumber || decoded.phone,
      email: decoded.email,
    };
    
    // Wrap next() inside the RLS Async Context so database queries have automatic secure context
    rlsContext.run({ userId: req.user.id, role: req.user.role }, () => {
      next(); // Pass control to the controller function
    });
  } catch (error) {
    return res.status(403).json({ error: 'Session expired or invalid token signature. Re-authenticate.' });
  }
};

// 2. Role-Based Access Control Gatekeeper
export const requireRole = (allowedRoles: ('CUSTOMER' | 'TRANSPORTER' | 'ADMIN')[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized. Your account tier lacks clearance for this action.' });
    }
    next();
  };
};
