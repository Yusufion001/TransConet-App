const fs = require('fs');
const file = 'src/routes/loadRoutes.ts';
let code = fs.readFileSync(file, 'utf8');

code = `import { validateRequest } from '../middleware/validateRequest';\nimport { createLoadSchema, updateLoadSchema } from '../schemas/loadSchemas';\n` + code;

code = code.replace(/router\.post\('\/create', authenticateToken, requireRole\(\['CUSTOMER', 'ADMIN'\]\), createLoad\);/g, `router.post('/create', authenticateToken, requireRole(['CUSTOMER', 'ADMIN']), validateRequest(createLoadSchema), createLoad);`);

code = code.replace(/router\.post\('\/loads', authenticateToken, requireRole\(\['CUSTOMER', 'ADMIN'\]\), createLoad\);/g, `router.post('/loads', authenticateToken, requireRole(['CUSTOMER', 'ADMIN']), validateRequest(createLoadSchema), createLoad);`);

code = code.replace(/router\.patch\('\/loads\/:id', authenticateToken, requireRole\(\['CUSTOMER', 'ADMIN'\]\), updateLoad\);/g, `router.patch('/loads/:id', authenticateToken, requireRole(['CUSTOMER', 'ADMIN']), validateRequest(updateLoadSchema), updateLoad);`);

code = code.replace(/router\.put\('\/loads\/:id', authenticateToken, requireRole\(\['CUSTOMER', 'ADMIN'\]\), updateLoad\);/g, `router.put('/loads/:id', authenticateToken, requireRole(['CUSTOMER', 'ADMIN']), validateRequest(updateLoadSchema), updateLoad);`);

fs.writeFileSync(file, code);
