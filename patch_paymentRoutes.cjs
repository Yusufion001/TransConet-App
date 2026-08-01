const fs = require('fs');
const file = 'src/routes/paymentRoutes.ts';
let code = fs.readFileSync(file, 'utf8');

code = `import { validateRequest } from '../middleware/validateRequest';\nimport { initializeEscrowSchema, verifyEscrowSchema, releaseEscrowSchema } from '../schemas/paymentSchemas';\n` + code;

code = code.replace(/router\.post\('\/initialize-escrow', authenticateToken, requireRole\(\['CUSTOMER', 'ADMIN'\]\), initializeEscrowPayment\);/g, `router.post('/initialize-escrow', authenticateToken, requireRole(['CUSTOMER', 'ADMIN']), validateRequest(initializeEscrowSchema), initializeEscrowPayment);`);

code = code.replace(/router\.post\('\/verify-escrow', authenticateToken, requireRole\(\['CUSTOMER', 'ADMIN'\]\), verifyEscrowPayment\);/g, `router.post('/verify-escrow', authenticateToken, requireRole(['CUSTOMER', 'ADMIN']), validateRequest(verifyEscrowSchema), verifyEscrowPayment);`);

code = code.replace(/router\.post\('\/release-escrow', authenticateToken, requireRole\(\['CUSTOMER', 'ADMIN'\]\), releaseEscrowPayment\);/g, `router.post('/release-escrow', authenticateToken, requireRole(['CUSTOMER', 'ADMIN']), validateRequest(releaseEscrowSchema), releaseEscrowPayment);`);

fs.writeFileSync(file, code);
