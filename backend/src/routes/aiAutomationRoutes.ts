import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { rateLimitMiddleware } from '../middleware/rateLimiter';
import { assistant, pendingActions, approve, reject } from '../controllers/aiAutomationController';

const router = Router();

router.use(rateLimitMiddleware, authenticateToken);
router.post('/assistant', assistant);
router.get('/actions', pendingActions);
router.post('/actions/:id/approve', approve);
router.post('/actions/:id/reject', reject);

export default router;
