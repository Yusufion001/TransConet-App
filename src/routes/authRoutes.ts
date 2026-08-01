import { Router } from 'express';
import { requestOTP, verifyOTP, checkPhoneStatus, loginPin, registerPin, logout, googleLogin } from '../controllers/authController';
import { validateRequest } from '../middleware/validateRequest';
import { z } from 'zod';

const router = Router();

const phoneSchema = z.object({
  body: z.object({
    phoneNumber: z.string().min(10).max(15).regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone format')
  })
});

const verifyOtpSchema = z.object({
  body: z.object({
    phoneNumber: z.string().min(10).max(15).regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone format'),
    otpCode: z.string().min(4).max(6)
  })
});

const pinSchema = z.object({
  body: z.object({
    phoneNumber: z.string().min(10).max(15).regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone format'),
    pin: z.string().min(4).max(64)
  })
});

router.post('/request-otp', validateRequest(phoneSchema), requestOTP);
router.post('/verify-otp', validateRequest(verifyOtpSchema), verifyOTP);
router.post('/check-phone-status', validateRequest(phoneSchema), checkPhoneStatus);
router.post('/login-pin', validateRequest(pinSchema), loginPin);
router.post('/register-pin', validateRequest(pinSchema), registerPin);
router.post('/logout', logout);
router.post('/google', googleLogin);

export default router;
