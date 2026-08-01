import fs from 'fs';
let content = fs.readFileSync('src/routes/fleetRoutes.ts', 'utf-8');

content = content.replace(
  "import { getCarrierFleet, registerVehicle, getMyVehicles, uploadDriverDocuments } from '../controllers/fleetController';",
  "import { getCarrierFleet, registerVehicle, getMyVehicles, uploadDriverDocuments, updateVehicleLocation, getNearbyVehicles } from '../controllers/fleetController';"
);

content += `
// Tracking routes
router.post('/:vehicleId/location', authenticateToken, updateVehicleLocation);
router.get('/nearby', authenticateToken, getNearbyVehicles);
`;

fs.writeFileSync('src/routes/fleetRoutes.ts', content);
