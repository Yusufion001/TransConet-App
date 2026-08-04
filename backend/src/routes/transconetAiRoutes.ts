import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { chatWithTransConetAi } from '../controllers/transconetAiController';

const router = Router();

router.post('/chat', authenticateToken, chatWithTransConetAi);

export default router;
