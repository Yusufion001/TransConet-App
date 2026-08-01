const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/routes/authRoutes.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace("ipKeyGenerator(req, res)", "ipKeyGenerator(req as any, res as any)");

fs.writeFileSync(file, content);
console.log('Patched');
