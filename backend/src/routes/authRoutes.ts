import { Router } from 'express';
import { requestOTP, verifyOTP, checkPhoneStatus, loginPin, registerPin, logout, googleLogin } from '../controllers/authController';
import { requestPasswordReset, confirmPasswordReset } from '../controllers/passwordResetController';
import { validateRequest } from '../middleware/validateRequest';
import { z } from 'zod';

const router = Router();

const phoneSchema = z.object({
  body: z.object({
    phoneNumber: z.string().min(10).max(15).regex(/^\+?\d{10,15}$/, 'Invalid phone format')
  })
});

const verifyOtpSchema = z.object({
  body: z.object({
    phoneNumber: z.string().min(10).max(15).regex(/^\+?\d{10,15}$/, 'Invalid phone format'),
    otpCode: z.string().min(4).max(6)
  })
});

const pinSchema = z.object({
  body: z.object({
    phoneNumber: z.string().min(10).max(15).regex(/^\+?\d{10,15}$/, 'Invalid phone format'),
    pin: z.string().min(4).max(64),
    email: z.string().optional(),
    role: z.string().optional(),
    fullName: z.string().optional()
  })
});

const passwordResetRequestSchema = z.object({
  body: z.object({
    email: z.string().email()
  })
});

const passwordResetConfirmSchema = z.object({
  body: z.object({
    email: z.string().email(),
    token: z.string().min(1).max(256),
    newPassword: z.string().min(6).max(128)
  })
});

router.post('/request-otp', validateRequest(phoneSchema), requestOTP);
router.post('/verify-otp', validateRequest(verifyOtpSchema), verifyOTP);
router.post('/check-phone-status', validateRequest(phoneSchema), checkPhoneStatus);
router.post('/login-pin', validateRequest(pinSchema), loginPin);
router.post('/register-pin', validateRequest(pinSchema), registerPin);
router.post('/reset-password-request', validateRequest(passwordResetRequestSchema), requestPasswordReset);
router.post('/reset-password-confirm', validateRequest(passwordResetConfirmSchema), confirmPasswordReset);
router.post('/logout', logout);
router.post('/google', googleLogin);

export default router;
