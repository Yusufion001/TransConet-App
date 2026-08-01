import { Router } from 'express';
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from '../controllers/admin/adminManagementController';
import { authenticateAdminOrSuper, requireSpecificAdminRole } from '../middleware/adminAuthMiddleware';

const router = Router();

router.use(authenticateAdminOrSuper);
router.use(requireSpecificAdminRole(['SUPER_ADMIN']));

router.get('/', getAdmins);
router.post('/', createAdmin);
router.put('/:id', updateAdmin);
router.delete('/:id', deleteAdmin);

export default router;
