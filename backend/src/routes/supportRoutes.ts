import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { authenticateAdminOrSuper } from '../middleware/adminAuthMiddleware';
import {
  getOrCreateActiveTicket,
  getTicketById,
  addSupportMessage,
  escalateTicketToAdmin,
  getAdminTicketsQueue,
  adminReplyToTicket,
  resolveTicket,
} from '../controllers/supportController';

const router = Router();

// User endpoints
router.get('/ticket', authenticateToken, getOrCreateActiveTicket);
router.post('/ticket', authenticateToken, getOrCreateActiveTicket);
router.get('/:ticketId', authenticateToken, getTicketById);
router.post('/message', authenticateToken, addSupportMessage);
router.post('/escalate', authenticateToken, escalateTicketToAdmin);

// Admin endpoints (Only Admin role can access)
router.get('/admin/queue', authenticateAdminOrSuper, getAdminTicketsQueue);
router.post('/admin/reply', authenticateAdminOrSuper, adminReplyToTicket);
router.post('/admin/resolve', authenticateAdminOrSuper, resolveTicket);

export default router;
