import { Router } from 'express';
import { triggerHaulageNotification } from '../controllers/notificationController';

const router = Router();

router.post('/haulage', triggerHaulageNotification);

export default router;
