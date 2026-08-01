import { validateRequest } from '../middleware/validateRequest';
import { createLoadSchema, updateLoadSchema } from '../schemas/loadSchemas';
import { Router } from 'express';
import { createLoad, getLoadPostings, getLoadById, updateLoad, getMyLoads } from '../controllers/loadController';
import { getMarketplaceLoads } from '../controllers/marketplaceController';
import { optimizePricing, autoMatchDrivers } from '../controllers/aiOptimizationController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { rateLimitMiddleware } from '../middleware/rateLimiter';

const router = Router();

// Shippers/Customers publish loads safely through token signatures
router.post('/create', authenticateToken, requireRole(['CUSTOMER', 'ADMIN']), validateRequest(createLoadSchema), createLoad);

// Live open marketplace queries for hauling loads (public or authenticated)
router.get('/marketplace', getMarketplaceLoads);
router.get('/my-loads', authenticateToken, requireRole(['CUSTOMER', 'ADMIN']), getMyLoads);

// Keep compatibility with existing routes but enforce security
router.get('/loads', getLoadPostings);
router.post('/loads', authenticateToken, requireRole(['CUSTOMER', 'ADMIN']), validateRequest(createLoadSchema), createLoad);
router.get('/loads/:id', getLoadById);
router.patch('/loads/:id', authenticateToken, requireRole(['CUSTOMER', 'ADMIN']), validateRequest(updateLoadSchema), updateLoad);
router.put('/loads/:id', authenticateToken, requireRole(['CUSTOMER', 'ADMIN']), validateRequest(updateLoadSchema), updateLoad);

// AI Optimization routes
router.post('/loads/:loadId/optimize-price', rateLimitMiddleware, authenticateToken, requireRole(['CUSTOMER', 'ADMIN']), optimizePricing);
router.post('/loads/:loadId/auto-match', rateLimitMiddleware, authenticateToken, requireRole(['CUSTOMER', 'ADMIN']), autoMatchDrivers);

export default router;
