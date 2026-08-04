import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { approveTransConetAction } from '../controllers/transconetActionController';

const router = Router();

router.post('/approve', authenticateToken, requireRole(['CUSTOMER']), approveTransConetAction);

export default router;
