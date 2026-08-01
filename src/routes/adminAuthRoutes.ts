import { Router } from 'express';
import { adminLogin, adminLogout } from '../controllers/admin/adminAuthController';
import { authenticateAdminOrSuper } from '../middleware/adminAuthMiddleware';

const router = Router();

router.post('/login', adminLogin);
router.post('/logout', authenticateAdminOrSuper, adminLogout);
router.get('/me', authenticateAdminOrSuper, (req, res) => {
  const admin = (req as any).adminUser;
  res.json({
    id: admin.id,
    email: admin.email,
    role: admin.role
  });
});

export default router;
