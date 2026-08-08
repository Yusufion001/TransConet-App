import { config } from "../../config/env";
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../db/prisma';
import crypto from 'crypto';
import { sendEmailAlert } from '../../services/emailService';

const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;
const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 3;

// In-memory OTP state is retained for compatibility with the current deployment.
// It is intentionally short-lived and bounded by the login flow.
const otpStore = new Map<string, { code: string; expires: number; failedAttempts: number }>();

const verifyCaptcha = (token?: string) => Boolean(token && token.length > 5);

const genericAuthError = 'Invalid credentials or insufficient permissions.';

export const adminLogin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, captchaToken, mfaToken } = req.body || {};
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail || typeof password !== 'string' || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (!verifyCaptcha(captchaToken)) {
      return res.status(400).json({ error: 'Invalid CAPTCHA.' });
    }

    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const deviceId = req.headers['x-device-id']?.toString() || 'unknown';

    const admin = await prisma.adminUser.findUnique({ where: { email: normalizedEmail } });

    // Do not auto-create privileged accounts during authentication. Account
    // provisioning must happen through an explicit administrative/bootstrap path.
    if (!admin) {
      return res.status(401).json({ error: genericAuthError });
    }

    if (admin.lockoutUntil && admin.lockoutUntil > new Date()) {
      return res.status(401).json({ error: genericAuthError });
    }

    const validRoles = new Set([
      'SUPER_ADMIN',
      'ADMIN',
      'PLATFORM_ADMIN',
      'FINANCE_ADMIN',
      'SUPPORT_ADMIN',
      'COMPLIANCE_ADMIN',
      'DEVELOPER'
    ]);

    if (!admin.isActive || !validRoles.has(String(admin.role))) {
      return res.status(401).json({ error: genericAuthError });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);

    if (!isMatch) {
      const attempts = admin.failedLoginAttempts + 1;
      const lockoutUntil = attempts >= MAX_FAILED_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_DURATION_MS)
        : null;

      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { failedLoginAttempts: attempts, lockoutUntil }
      });

      if (attempts >= MAX_FAILED_ATTEMPTS) {
        try {
          await sendEmailAlert(
            'yusufjimoh969@gmail.com',
            'Security Alert: Multiple Failed Login Attempts',
            `<p>Multiple failed login attempts were detected for admin: ${admin.email}.</p><p>IP: ${ipAddress}</p>`
          );
        } catch (alertError) {
          console.error('Failed to send failed-login alert:', alertError);
        }
      }

      return res.status(401).json({ error: genericAuthError });
    }

    // A successful password check resets the failed-attempt counter only after
    // all account-state checks above have passed.
    if (!mfaToken) {
      const otpCode = crypto.randomInt(100000, 1000000).toString();
      otpStore.set(admin.id, {
        code: otpCode,
        expires: Date.now() + OTP_TTL_MS,
        failedAttempts: 0
      });

      try {
        await sendEmailAlert(
          'yusufjimoh969@gmail.com',
          'Admin Login Attempt Approval',
          `<p>An attempt to log in to the TransConet Admin Portal was detected.</p>
           <p><strong>Admin Email:</strong> ${admin.email}</p>
           <p><strong>OTP Token:</strong> <span style="font-size: 1.5em; font-weight: bold; letter-spacing: 2px;">${otpCode}</span></p>
           <p>If you did not initiate this login, please ignore this email.</p>`
        );
      } catch (err) {
        console.error('Failed to send admin OTP email:', err);
        return res.status(503).json({ error: 'Unable to complete administrator verification. Please try again.' });
      }

      return res.status(200).json({ requireMfa: true, message: 'OTP sent successfully.' });
    }

    const suppliedOtp = typeof mfaToken === 'string' ? mfaToken.trim() : '';
    const storedOtp = otpStore.get(admin.id);

    if (!storedOtp || storedOtp.expires < Date.now()) {
      otpStore.delete(admin.id);
      return res.status(401).json({ error: genericAuthError });
    }

    if (!/^\d{6}$/.test(suppliedOtp) || storedOtp.code !== suppliedOtp) {
      storedOtp.failedAttempts += 1;
      if (storedOtp.failedAttempts >= MAX_OTP_ATTEMPTS) {
        otpStore.delete(admin.id);
        try {
          await sendEmailAlert(
            'yusufjimoh969@gmail.com',
            'Security Alert: Multiple Failed OTP Verifications',
            `<p>Multiple failed OTP attempts for admin: ${admin.email}.</p><p>IP: ${ipAddress}</p>`
          );
        } catch (alertError) {
          console.error('Failed to send OTP failure alert:', alertError);
        }
      }
      return res.status(401).json({ error: genericAuthError });
    }

    otpStore.delete(admin.id);

    if (admin.lastLoginDeviceId && admin.lastLoginDeviceId !== deviceId) {
      try {
        await sendEmailAlert(
          'yusufjimoh969@gmail.com',
          'Security Alert: New Device Login',
          `<p>Admin ${admin.email} logged in from a new device or browser.</p><p>IP: ${ipAddress}</p><p>User Agent: ${userAgent}</p>`
        );
      } catch (alertError) {
        console.error('Failed to send new-device alert:', alertError);
      }
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

    const result = await prisma.$transaction([
      prisma.adminUser.update({
        where: { id: admin.id },
        data: {
          failedLoginAttempts: 0,
          lockoutUntil: null,
          lastLoginAt: new Date(),
          lastLoginIp: ipAddress,
          lastLoginDeviceId: deviceId
        }
      }),
      prisma.adminSession.create({
        data: {
          adminUserId: admin.id,
          token: sessionToken,
          ipAddress,
          userAgent,
          deviceId,
          expiresAt
        }
      }),
      prisma.adminAuditLog.create({
        data: {
          adminUserId: admin.id,
          action: 'LOGIN_SUCCESS_OTP',
          ipAddress,
          userAgent
        }
      })
    ]);

    const updatedAdmin = result[0];
    const jwtToken = jwt.sign(
      { adminId: updatedAdmin.id, role: updatedAdmin.role, sessionToken },
      config.adminJwtSecret,
      { expiresIn: '8h' }
    );

    res.cookie('admin_token', jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 8 * 60 * 60 * 1000,
      path: '/'
    });

    return res.status(200).json({
      message: 'Admin login successful.',
      token: jwtToken,
      admin: {
        id: updatedAdmin.id,
        email: updatedAdmin.email,
        role: updatedAdmin.role
      }
    });
  } catch (error: any) {
    console.error('Admin login error:', error?.message || error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

export const adminLogout = async (req: Request, res: Response): Promise<any> => {
  try {
    const adminReq = req as any;
    if (adminReq.adminSessionToken) {
      await prisma.adminSession.deleteMany({ where: { token: adminReq.adminSessionToken } });
      await prisma.adminAuditLog.create({
        data: {
          adminUserId: adminReq.adminUser?.id,
          action: 'LOGOUT',
          ipAddress: req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown'
        }
      });
    }

    res.clearCookie('admin_token', { httpOnly: true, secure: true, sameSite: 'none', path: '/' });
    return res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error: any) {
    console.error('Admin logout error:', error?.message || error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
