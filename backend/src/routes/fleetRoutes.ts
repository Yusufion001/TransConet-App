// src/routes/fleetRoutes.ts
import { Router } from 'express';
import { getCarrierFleet, getMyVehicles, registerVehicle, uploadDriverDocuments, updateVehicleLocation, getNearbyVehicles } from '../controllers/fleetController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/carrier-fleet', authenticateToken, getCarrierFleet);
router.get('/my-vehicles', authenticateToken, getMyVehicles);
router.post('/register', authenticateToken, registerVehicle);
router.post('/upload-documents', authenticateToken, uploadDriverDocuments);
router.patch('/:vehicleId/location', authenticateToken, updateVehicleLocation);
router.get('/nearby', authenticateToken, getNearbyVehicles);

export default router;
