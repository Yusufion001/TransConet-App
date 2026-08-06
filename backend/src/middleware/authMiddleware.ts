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
  role: 'CUSTOMER' | 'TRANSPORTER' | 'ADMIN' | 'SHIPPER';
  phoneNumber?: string;
  email?: string;
}

// 1. Verify Authentication Token Middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Only accept Bearer tokens from the Authorization header. Cookie-based sessions
  // are supported only through a dedicated session middleware that enforces CSRF.
  const authHeader = req.headers['authorization'];
  const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : undefined;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Use Authorization: Bearer <token>.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload & any;

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
