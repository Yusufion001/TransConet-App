import { Router } from 'express';
import { verifyBiometrics, getKYCStatus, uploadAndVerifyKyc } from '../controllers/kycController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Endpoint for submitting biometrics and ID registry comparison
router.post('/verify-biometrics', authenticateToken, verifyBiometrics);

// Endpoint for checking the current authenticated user's KYC progress & verified state
router.get('/status', authenticateToken, getKYCStatus);

// Endpoint for uploading and verifying KYC documents
router.post('/upload-document', authenticateToken, uploadAndVerifyKyc);

export default router;
