const fs = require('fs');
let code = fs.readFileSync('src/routes/adminRoutes.ts', 'utf8');

const importReplacement = `import { getAdminFleet, getAdminLoads } from '../controllers/adminController';`;
code = code.replace(/import \{ verifyVehicle/, importReplacement + '\nimport { verifyVehicle');

const newRoutes = `
// Endpoints for Fleet and Loads
router.get('/fleet', requireSpecificAdminRole(['SUPER_ADMIN', 'PLATFORM_ADMIN', 'SUPPORT_ADMIN']), getAdminFleet);
router.get('/loads', requireSpecificAdminRole(['SUPER_ADMIN', 'PLATFORM_ADMIN', 'SUPPORT_ADMIN']), getAdminLoads);
`;

code = code.replace(/export default router;/, newRoutes + '\nexport default router;');

fs.writeFileSync('src/routes/adminRoutes.ts', code);
