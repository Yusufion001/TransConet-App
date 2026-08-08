import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { rlsContext } from '../db/prisma';
import { config } from '../config/env';

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
  sub?: string;
  id?: string;
  userId?: string;
  role?: string;
  phoneNumber?: string;
  phone?: string;
  email?: string;
}

const USER_ROLES = new Set(['CUSTOMER', 'TRANSPORTER', 'ADMIN']);

/** Verifies application JWTs and establishes the RLS request context. */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Security authentication token missing.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;
    const userId = decoded.sub || decoded.userId || decoded.id;
    let effectiveRole = String(decoded.role || 'CUSTOMER').toUpperCase();

    if (effectiveRole === 'SHIPPER') effectiveRole = 'CUSTOMER';

    if (!userId || !USER_ROLES.has(effectiveRole)) {
      return res.status(403).json({ error: 'Invalid application authentication claims.' });
    }

    req.user = {
      id: userId,
      role: effectiveRole as 'CUSTOMER' | 'TRANSPORTER' | 'ADMIN',
      phoneNumber: decoded.phoneNumber || decoded.phone,
      email: decoded.email,
    };

    rlsContext.run({ userId, role: effectiveRole }, () => next());
  } catch {
    return res.status(403).json({ error: 'Session expired or invalid token signature. Re-authenticate.' });
  }
};

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
