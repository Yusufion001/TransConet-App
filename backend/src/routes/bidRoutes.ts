// src/routes/bidRoutes.ts
import { Router } from 'express';
import { placeBid, acceptBid, getMyBids } from '../controllers/bidController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { rateLimitMiddleware } from '../middleware/rateLimiter';

const router = Router();

router.get('/my-bids', authenticateToken, requireRole(['TRANSPORTER', 'ADMIN']), getMyBids);

router.post('/submit', rateLimitMiddleware, authenticateToken, requireRole(['TRANSPORTER', 'ADMIN']), placeBid);

router.post('/accept', rateLimitMiddleware, authenticateToken, requireRole(['CUSTOMER', 'ADMIN']), acceptBid);

export default router;
