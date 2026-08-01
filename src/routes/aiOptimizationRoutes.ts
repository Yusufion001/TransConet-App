import { Router } from 'express';
import { optimizeRoute, detectFraud } from '../controllers/aiOptimizationController';
import { authenticateToken } from '../middleware/authMiddleware';
import { rateLimitMiddleware } from '../middleware/rateLimiter';

const router = Router();

router.post('/optimize-route', rateLimitMiddleware, authenticateToken, optimizeRoute);
router.post('/detect-fraud', rateLimitMiddleware, authenticateToken, detectFraud);

export default router;
