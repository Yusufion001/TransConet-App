import { Router } from 'express';
import { memoryUpload as upload } from '../middleware/upload';
import { getShipperInboundBids, updateBidStatus, uploadShipperDocuments } from '../controllers/shipperController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// --- YOUR EXISTING ROUTES ---
router.get('/bids/inbound', authenticateToken, requireRole(['CUSTOMER', 'ADMIN']), getShipperInboundBids);
router.post('/bids/action', authenticateToken, requireRole(['CUSTOMER', 'ADMIN']), updateBidStatus);

// --- YOUR NEW UPLOAD ROUTE ---
router.post(
  '/upload-docs',
  authenticateToken, 
  requireRole(['CUSTOMER', 'ADMIN']),
  upload.fields([
    { name: 'cacCertificate', maxCount: 1 },
    { name: 'cacStatusReport', maxCount: 1 }
  ]), 
  uploadShipperDocuments 
);

export default router;
