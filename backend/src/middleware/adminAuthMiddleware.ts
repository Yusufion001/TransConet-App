import { config } from "../config/env";
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma, rlsContext } from '../db/prisma';

const sessionLastActive = new Map<string, number>();
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const ADMIN_ROLES = new Set([
  'ADMIN',
  'SUPER_ADMIN',
  'PLATFORM_ADMIN',
  'FINANCE_ADMIN',
  'SUPPORT_ADMIN',
  'COMPLIANCE_ADMIN',
  'DEVELOPER',
]);

export const authenticateAdminOrSuper = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  let token = req.headers['authorization']?.split(' ')[1];
  if (!token && req.cookies?.admin_token) token = req.cookies.admin_token;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Authentication token missing.' });
  }

  try {
    // Admin tokens must be signed with the dedicated admin secret. A normal
    // application JWT must never be accepted as an admin credential.
    const decoded = jwt.verify(token, config.adminJwtSecret) as {
      adminId?: string;
      role?: string;
      sessionToken?: string;
    };

    if (!decoded.sessionToken || !decoded.adminId || !decoded.role || !ADMIN_ROLES.has(String(decoded.role))) {
      return res.status(401).json({ error: 'Invalid or incomplete administrator session.' });
    }

    const lastActive = sessionLastActive.get(decoded.sessionToken);
    const now = Date.now();

    if (lastActive && now - lastActive > IDLE_TIMEOUT_MS) {
      sessionLastActive.delete(decoded.sessionToken);
      await prisma.adminSession.deleteMany({ where: { token: decoded.sessionToken } });
      await prisma.adminAuditLog.create({
        data: {
          adminUserId: decoded.adminId,
          action: 'SESSION_EXPIRED_IDLE',
          ipAddress: req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown'
        }
      });
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

    if (!session || session.adminUserId !== decoded.adminId) {
      return res.status(401).json({ error: 'Admin session expired or invalid.' });
    }

    if (session.expiresAt < new Date()) {
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

    if (!session.adminUser.isActive || !ADMIN_ROLES.has(String(session.adminUser.role))) {
      return res.status(403).json({ error: 'Admin account is inactive or unauthorized.' });
    }

    // Prevent a stale/altered role claim from granting more privilege than the
    // current database record. The database role is authoritative.
    if (String(session.adminUser.role) !== String(decoded.role)) {
      return res.status(401).json({ error: 'Administrator session is stale. Please log in again.' });
    }

    sessionLastActive.set(decoded.sessionToken, now);
    const adminRole = String(session.adminUser.role);
    (req as any).user = { id: session.adminUser.id, role: adminRole, email: session.adminUser.email };
    (req as any).adminUser = session.adminUser;
    (req as any).adminSessionToken = session.token;

    rlsContext.run({ userId: session.adminUser.id, role: adminRole }, () => next());
  } catch {
    return res.status(401).json({ error: 'Invalid or expired administrator token.' });
  }
};

export const requireSpecificAdminRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): any => {
    const admin = (req as any).adminUser;
    const currentRole = String(admin?.role || '');

    // SUPER_ADMIN is the only global administrator. Every other role must match
    // the route's allow-list exactly; ADMIN is not a wildcard.
    if (currentRole === 'SUPER_ADMIN' || allowedRoles.includes(currentRole)) return next();

    return res.status(403).json({ error: 'Unauthorized admin role for this action.' });
  };
};
