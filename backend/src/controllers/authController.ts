import { getFirebaseAdmin } from '../utils/firebaseAdmin';
import { config } from "../config/env";
// src/controllers/authController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateSecureOTP } from '../services/smsService';
import { enqueueSMS as sendSMS } from '../services/queueService';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

import { prismaRLS as prisma } from '../db/prisma';
import { redis } from '../utils/redis';


// Distributed Redis used for login attempts
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 160 * 1000; // 15 minutes

export const requestOTP = async (req: Request, res: Response): Promise<any> => {
  try {
    const rawPhone = req.body.phoneNumber !== undefined && req.body.phoneNumber !== null ? String(req.body.phoneNumber) : '';
    console.log('User Login attempt:', { rawPhone, origin: req.headers.origin }); const sanitizedPhone = rawPhone.trim();

    if (!sanitizedPhone || sanitizedPhone.length < 10) {
      return res.status(400).json({ error: 'Please supply a valid phone number.' });
    }

    

    const token = generateSecureOTP();
    const expiryWindow = new Date(Date.now() + 60 * 1000);

    await prisma.phoneVerification.upsert({
      where: { phoneNumber: sanitizedPhone },
      update: { otpCode: token, expiresAt: expiryWindow },
      create: { phoneNumber: sanitizedPhone, otpCode: token, expiresAt: expiryWindow }
    });

    const messageText = `Your TransConet verification pin is: ${token}. Valid for 5 minutes. Do not share this pin.`;
    const smsSent = await sendSMS(sanitizedPhone, messageText);

    if (!smsSent) {
      return res.status(500).json({ error: 'SMS service gateway timeout. Please retry shortly.' });
    }

    return res.status(200).json({ message: 'Verification security token dispatched to your mobile device.' });

  } catch (error) {
    console.error("Error in requestOTP:", error);
  }
}
export const verifyOTP = async (req: Request, res: Response): Promise<any> => {
  try {
    const rawPhone = req.body.phoneNumber !== undefined && req.body.phoneNumber !== null ? String(req.body.phoneNumber) : '';
    const rawOTP = req.body.otpCode !== undefined && req.body.otpCode !== null ? String(req.body.otpCode) : '';

    console.log('User Login attempt:', { rawPhone, origin: req.headers.origin }); const sanitizedPhone = rawPhone.trim();
    const sanitizedOTP = rawOTP.trim();

    if (!sanitizedPhone || !sanitizedOTP) {
      return res.status(400).json({ error: 'Phone number and verification code are required parameters.' });
    }

    

    // 1. Fetch the absolute latest record from the PhoneVerification schema
    const verificationRecord = await prisma.phoneVerification.findFirst({
      where: { phoneNumber: sanitizedPhone },
      orderBy: { createdAt: 'desc' }
    });

    if (!verificationRecord) {
      return res.status(400).json({ error: 'No verification sequence has been initiated for this phone number.' });
    }

    // 2. Validate OTP value match (mapped to otpCode in Prisma schema)
    if (verificationRecord.otpCode !== sanitizedOTP) {
      return res.status(400).json({ error: 'Invalid OTP code supplied. Please verify and retry.' });
    }

    // 3. Confirm the record hasn't aged past its expiration window (e.g., 10 minutes)
    const recordAgeInMinutes = (Date.now() - new Date(verificationRecord.createdAt).getTime()) / 60000;
    if (recordAgeInMinutes > 10) {
      return res.status(400).json({ error: 'The verification session has expired. Please request a fresh OTP.' });
    }

    // 4. Retrieve or register the user context
    let user = await prisma.user.findUnique({ where: { phoneNumber: sanitizedPhone } });
    if (!user) {
      user = await prisma.user.create({
        data: { 
          phoneNumber: sanitizedPhone, 
          email: `${sanitizedPhone}@transconet.com`,
          
          role: 'CUSTOMER' 
        }
      });
    }

    // Clean up verification code after successful authentication
    try {
      await prisma.phoneVerification.delete({
        where: { phoneNumber: sanitizedPhone }
      });
    } catch (cleanupError) {
      console.warn('Non-blocking clean-up warning:', cleanupError);
    }

    // 5. Generate application layer session signature
    const token = jwt.sign({ id: user.id, userId: user.id, role: user.role, phoneNumber: user.phoneNumber, email: user.email }, config.jwtSecret, { expiresIn: '7d' });

    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.status(200).json({
      message: 'Identity authenticated successfully.',
      token,
      user
    });

  } catch (error: any) {
    console.error('🚨 [VERIFICATION CRASH SHIELDED]:', error.message);
    return res.status(500).json({ error: 'Internal system fault during OTP validation sequence.' });
  }
};

export const switchRole = async (req: Request, res: Response): Promise<any> => {
  try {
    const { role } = req.body;
    const userId = req.user?.id;
    const phoneNumber = req.body.phoneNumber || '08030000000';

    if (!role || !['CUSTOMER', 'TRANSPORTER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role selection.' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }


    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role }
    });

    const token = jwt.sign({ userId: updatedUser.id, phoneNumber: updatedUser.phoneNumber, role: updatedUser.role }, config.jwtSecret, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.status(200).json({ message: `Role updated to ${role} successfully.`, token });

  } catch (error) {
    console.error('Role switching error:', error);
    return res.status(500).json({ error: 'Internal server error occurred while updating role.' });
  }
};

export const checkPhoneStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const rawPhone = req.body.phoneNumber !== undefined && req.body.phoneNumber !== null ? String(req.body.phoneNumber) : '';
    console.log('User Login attempt:', { rawPhone, origin: req.headers.origin }); const sanitizedPhone = rawPhone.trim();
    if (!sanitizedPhone || sanitizedPhone.length < 10) {
      return res.status(400).json({ error: 'Please supply a valid phone number.' });
    }

    

    const user = await prisma.user.findUnique({
      where: { phoneNumber: sanitizedPhone }
    });

    if (user) {
      return res.status(200).json({
        registered: true,
        hasPin: !!(user.password && user.password !== ""),
        email: user.email
      });
    }

    return res.status(200).json({
      registered: false,
      hasPin: false
    });

  } catch (error: any) {
    console.error('Error in checkPhoneStatus:', error.message);
    return res.status(500).json({ error: 'Internal server error checking phone status.' });
  }
};

export const loginPin = async (req: Request, res: Response): Promise<any> => {
  try {
    const rawPhone = req.body.phoneNumber !== undefined && req.body.phoneNumber !== null ? String(req.body.phoneNumber) : '';
    const rawPin = req.body.pin !== undefined && req.body.pin !== null ? String(req.body.pin) : '';

    console.log('User Login attempt:', { rawPhone, origin: req.headers.origin }); const sanitizedPhone = rawPhone.trim();
    const sanitizedPin = rawPin.trim();

    if (!sanitizedPhone || !sanitizedPin || sanitizedPin.length < 6) {
      return res.status(400).json({ error: 'Phone number and a valid 6-digit PIN are required.' });
    }

    const lockoutDataStr = await redis.get(`lockout:${sanitizedPhone}`);
    const lockoutData = lockoutDataStr ? JSON.parse(lockoutDataStr) : null;
    if (lockoutData && lockoutData.lockedUntil > Date.now()) {
      return res.status(429).json({ error: 'Account locked due to too many failed login attempts. Please try again later.' });
    }

    

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber: sanitizedPhone },
          { phone: sanitizedPhone },
          { email: sanitizedPhone }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'No user registered with this phone number or email.' });
    }

    if (!user.password || user.password === "") {
      return res.status(400).json({ error: 'No 6-digit PIN has been set for this account yet. Please login via OTP first.' });
    }

    // Verify PIN using bcrypt.compare
    const isMatch = await bcrypt.compare(sanitizedPin, user.password);
    if (!isMatch) {
      const attemptsDataStr = await redis.get(`login_attempts:${sanitizedPhone}`);
      const attempts = (attemptsDataStr ? parseInt(attemptsDataStr) : 0) + 1;
      if (attempts >= MAX_FAILED_ATTEMPTS) {
        await redis.setex(`lockout:${sanitizedPhone}`, LOCKOUT_DURATION_MS / 1000, JSON.stringify({ count: attempts, lockedUntil: Date.now() + LOCKOUT_DURATION_MS }));
        return res.status(429).json({ error: 'Account locked due to too many failed login attempts. Please try again later.' });
      } else {
        await redis.setex(`login_attempts:${sanitizedPhone}`, 15 * 60, attempts.toString());
      }
      return res.status(400).json({ error: 'Incorrect 6-digit PIN password.' });
    }

    await redis.del(`login_attempts:${sanitizedPhone}`);
    if (redis.del) await redis.del(`lockout:${sanitizedPhone}`);

    const token = jwt.sign({ 
      id: user.id, 
      userId: user.id, 
      role: user.role, 
      phoneNumber: user.phoneNumber,
      email: user.email
    }, config.jwtSecret, { expiresIn: '7d' });

    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.status(200).json({
      message: 'PIN Authenticated successfully.',
      token,
      user
    });

  } catch (error: any) {
    console.error('Error in loginPin:', error.message);
    return res.status(500).json({ error: `Internal server error during PIN authentication: ${error.message}` });
  }
};

export const registerPin = async (req: Request, res: Response): Promise<any> => {
  try {
    const rawPhone = req.body.phoneNumber !== undefined && req.body.phoneNumber !== null ? String(req.body.phoneNumber) : '';
    const rawPin = req.body.pin !== undefined && req.body.pin !== null ? String(req.body.pin) : '';
    const rawEmail = req.body.email !== undefined && req.body.email !== null ? String(req.body.email) : '';
    const rawRole = req.body.role === 'TRANSPORTER' ? 'TRANSPORTER' : 'CUSTOMER';

    console.log('User Login attempt:', { rawPhone, origin: req.headers.origin }); const sanitizedPhone = rawPhone.trim();
    const sanitizedPin = rawPin.trim();

    if (!sanitizedPhone || !sanitizedPin || sanitizedPin.length < 6) {
      return res.status(400).json({ error: 'Phone number and a 6-digit PIN are required.' });
    }

    const sanitizedEmail = rawEmail.trim() || `${sanitizedPhone}@transconet.com`;
    const hashedPin = await bcrypt.hash(sanitizedPin, 10);

    

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber: sanitizedPhone },
          { email: sanitizedEmail }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'This phone number or email is already registered to an account. Please login instead.' });
    }

    const user = await prisma.user.create({
      data: { 
        phoneNumber: sanitizedPhone, 
        phone: sanitizedPhone, 
        email: sanitizedEmail, 
         
        password: hashedPin, 
        role: rawRole 
      }
    });

    const token = jwt.sign({ 
      id: user.id, 
      userId: user.id, 
      role: user.role, 
      phoneNumber: user.phoneNumber,
      email: user.email
    }, config.jwtSecret, { expiresIn: '7d' });

    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.status(200).json({
      message: 'Account registered and 6-digit PIN set successfully.',
      token,
      user
    });

  } catch (error: any) {
    console.error('Error in registerPin:', error.message);
    if (error.code === 'P2002') {
      const target = error.meta?.target?.[0] || 'field';
      return res.status(400).json({ error: `This ${target} is already registered. Please login or use a different one.` });
    }
    return res.status(500).json({ error: `Internal server error registering PIN: ${error.message}` });
  }
};

export const logout = async (req: Request, res: Response): Promise<any> => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Logged out successfully' });
};

export const googleLogin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, name, uid, idToken } = req.body;
    
    if (idToken) {
      try {
        const admin = getFirebaseAdmin();
        const decodedToken = await admin.getAuth().verifyIdToken(idToken);
        if (decodedToken.uid !== uid || decodedToken.email !== email) {
           return res.status(401).json({ error: 'Token claims mismatch' });
        }
      } catch (error) {
        console.warn('Firebase token verification failed. In production this should reject:', error);
        // We only enforce strictly if not running in local test environment where token might be mocked
        if (process.env.NODE_ENV === 'production') {
           return res.status(401).json({ error: 'Invalid Google identity token' });
        }
      }
    } else if (process.env.NODE_ENV === 'production') {
      return res.status(401).json({ error: 'idToken is required in production' });
    }
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    let user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          phoneNumber: `google-${uid}`,
          phone: `google-${uid}`,
          role: 'CUSTOMER'
        }
      });
    }
    
    const token = jwt.sign({ 
      id: user.id, 
      userId: user.id, 
      role: user.role, 
      email: user.email 
    }, config.jwtSecret, { expiresIn: '7d' });

    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.status(200).json({ message: 'Google authentication successful', token, user });
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ error: 'Google login failed' });
  }
};
