import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prismaRLS as prisma } from '../db/prisma';
import { redis } from '../utils/redis';
import { sendEmailAlert } from '../services/emailService';

const RESET_TTL_SECONDS = 10 * 60;
const RESET_RATE_LIMIT_SECONDS = 60;

const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const requestPasswordReset = async (req: Request, res: Response): Promise<any> => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Please supply a valid email address.' });
  }

  const genericResponse = {
    message: 'If an account exists for that email, a secure password reset token has been sent.'
  };

  try {
    const rateKey = `password_reset_rate:${email}`;
    if (await redis.get(rateKey)) return res.status(200).json(genericResponse);
    await redis.setex(rateKey, RESET_RATE_LIMIT_SECONDS, '1');

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(200).json(genericResponse);

    const token = crypto.randomBytes(32).toString('hex');
    await redis.setex(
      `password_reset:${hashToken(token)}`,
      RESET_TTL_SECONDS,
      JSON.stringify({ userId: user.id, email: user.email })
    );

    const html = `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>TransConet Password Reset</h2><p>Use this secure token to reset your password:</p><p style="font-family:monospace;font-size:16px;word-break:break-all">${token}</p><p>This token expires in 10 minutes and can only be used once.</p><p>If you did not request this reset, ignore this email.</p></div>`;
    await sendEmailAlert(user.email, 'TransConet password reset', html);
    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({ error: 'Unable to process password recovery request.' });
  }
};

export const confirmPasswordReset = async (req: Request, res: Response): Promise<any> => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const token = String(req.body?.token || '').trim();
  const newPassword = String(req.body?.newPassword || '').trim();

  if (!/^\S+@\S+\.\S+$/.test(email) || !token || newPassword.length < 6) {
    return res.status(400).json({ error: 'Email, reset token, and a password of at least 6 characters are required.' });
  }

  try {
    const resetKey = `password_reset:${hashToken(token)}`;
    const stored = await redis.get(resetKey);
    if (!stored) return res.status(400).json({ error: 'Invalid or expired reset token.' });

    const resetData = JSON.parse(stored);
    if (String(resetData.email).toLowerCase() !== email) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    await prisma.user.update({
      where: { id: resetData.userId },
      data: { password: await bcrypt.hash(newPassword, 10) }
    });

    await redis.del(resetKey);
    return res.status(200).json({ message: 'Your password has been reset successfully.' });
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    return res.status(500).json({ error: 'Unable to complete password reset.' });
  }
};
