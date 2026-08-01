import { validateRequest } from '../middleware/validateRequest';
import { initializeEscrowSchema, verifyEscrowSchema, releaseEscrowSchema } from '../schemas/paymentSchemas';
import { Router } from 'express';
import { initializeEscrowPayment, verifyEscrowPayment, releaseEscrowPayout } from '../controllers/paymentController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { rateLimitMiddleware } from '../middleware/rateLimiter';

const router = Router();

// Escrow initialization requires a customer or admin
router.post('/initialize-escrow', authenticateToken, requireRole(['CUSTOMER', 'ADMIN', 'TRANSPORTER']), rateLimitMiddleware, validateRequest(initializeEscrowSchema), initializeEscrowPayment);

// Verification should be done by customer or admin (often called post-payment)
router.post('/verify-escrow', authenticateToken, requireRole(['CUSTOMER', 'ADMIN', 'TRANSPORTER']), rateLimitMiddleware, validateRequest(verifyEscrowSchema), verifyEscrowPayment);

// Release escrow must be done by the customer who created the load, or an admin
router.post('/release-escrow', authenticateToken, requireRole(['CUSTOMER', 'ADMIN', 'TRANSPORTER']), rateLimitMiddleware, validateRequest(releaseEscrowSchema), releaseEscrowPayout);

export default router;

import { paystackWebhook } from '../controllers/webhookController';
// Webhook for Paystack server-to-server notifications
// Note: This route must bypass CSRF and authentication
router.post('/webhook/paystack', paystackWebhook);
