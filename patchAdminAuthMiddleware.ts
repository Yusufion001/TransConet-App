import fs from 'fs';

const filePath = 'src/middleware/adminAuthMiddleware.ts';
let code = fs.readFileSync(filePath, 'utf8');

const newCode = `import { config } from "../config/env";
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma, rlsContext } from '../db/prisma';
import { sendEmailAlert } from '../services/emailService';

// We'll use a simple in-memory map or Redis for idle timeouts. 
// For this environment, an in-memory Map is sufficient if there's only one container.
// To be robust across containers without relying on Redis availability, we could also use a signed cookie.
// But we'll just track it in a global Map for the preview.
const sessionLastActive = new Map<string, number>();
const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 mins

export const authenticateAdminOrSuper = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  let token = req.headers['authorization']?.split(' ')[1];
  
  if (!token && req.cookies?.admin_token) {
    token = req.cookies.admin_token;
  }
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Authentication token missing.' });
  }

  try {
    let decoded: any;
    try {
      decoded = jwt.verify(token, config.adminJwtSecret) as any;
    } catch (err) {
      decoded = jwt.verify(token, config.jwtSecret) as any;
    }
    
    if (decoded.sessionToken) {
      // Idle timeout check
      const lastActive = sessionLastActive.get(decoded.sessionToken);
      const now = Date.now();
      
      if (lastActive && (now - lastActive > IDLE_TIMEOUT_MS)) {
        // Idle timeout exceeded
        sessionLastActive.delete(decoded.sessionToken);
        await prisma.adminSession.deleteMany({ where: { token: decoded.sessionToken } });
        
        const decodedAdminId = decoded.adminId || decoded.id;
        if (decodedAdminId) {
            await prisma.adminAuditLog.create({
               data: {
                 adminUserId: decodedAdminId,
                 action: 'SESSION_EXPIRED_IDLE',
                 ipAddress: req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown',
                 userAgent: req.headers['user-agent'] || 'unknown'
               }
            });
        }
        
        return res.status(401).json({ error: 'Session expired due to inactivity. Please log in again.' });
      }

      let session;
      try {
        session = await prisma.adminSession.findUnique({
          where: { token: decoded.sessionToken },
          include: { adminUser: true }
        });
      } catch (dbError) {
        console.error('Database error in admin middleware:', dbError);
        return res.status(500).json({ error: 'Database unavailable for admin session verification.' });
      }

      if (!session) {
        return res.status(401).json({ error: 'Admin session expired or invalid.' });
      }
      
      if (session.expiresAt < new Date()) {
         // Absolute timeout exceeded
         await prisma.adminSession.deleteMany({ where: { token: decoded.sessionToken } });
         await prisma.adminAuditLog.create({
            data: {
              adminUserId: session.adminUser.id,
              action: 'SESSION_EXPIRED_ABSOLUTE',
              ipAddress: req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown',
              userAgent: req.headers['user-agent'] || 'unknown'
            }
         });
         return res.status(401).json({ error: 'Admin session expired. Please log in again.' });
      }

      if (!session.adminUser.isActive) {
        return res.status(403).json({ error: 'Admin account is deactivated.' });
      }

      // Update last active
      sessionLastActive.set(decoded.sessionToken, now);

      (req as any).user = {
        id: session.adminUser.id,
        role: 'ADMIN',
        email: session.adminUser.email
      };
      (req as any).adminUser = session.adminUser;
      (req as any).adminSessionToken = session.token;
      
      rlsContext.run({ userId: session.adminUser.id, role: 'ADMIN' }, () => {
        next();
      });
      return;
    } 
    
    if (decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN' || decoded.role === 'PLATFORM_ADMIN') {
      (req as any).user = {
        id: decoded.userId || decoded.id,
        role: decoded.role,
        phoneNumber: decoded.phoneNumber || decoded.phone,
        email: decoded.email,
      };
      
      rlsContext.run({ userId: (req as any).user.id, role: (req as any).user.role }, () => {
        next();
      });
      return;
    }
    
    return res.status(403).json({ error: 'Unauthorized. You must be an administrator.' });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export const requireSpecificAdminRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): any => {
    const admin = (req as any).adminUser;
    
    if (!admin) { 
       if ((req as any).user && ((req as any).user.role === 'ADMIN' || (req as any).user.role === 'SUPER_ADMIN')) {
         if (allowedRoles.includes('SUPER_ADMIN') || allowedRoles.includes('PLATFORM_ADMIN') || allowedRoles.includes('ADMIN')) {
           return next();
         }
       }
       return res.status(403).json({ error: 'Unauthorized admin role for this action.' });
    }

    // SUPER_ADMIN has full access
    if (admin.role === 'SUPER_ADMIN') {
        return next();
    }

    if (!allowedRoles.includes(admin.role) && !allowedRoles.includes('ADMIN')) {
      return res.status(403).json({ error: 'Unauthorized admin role for this action.' });
    }
    
    next();
  };
};
`;

fs.writeFileSync(filePath, newCode);
