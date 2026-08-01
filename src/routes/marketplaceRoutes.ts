// src/routes/marketplaceRoutes.ts
import { Router } from 'express';
import { getMarketplaceLoads } from '../controllers/marketplaceController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/board', authenticateToken, getMarketplaceLoads);

export default router;
