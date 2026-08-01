const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/routes/authRoutes.ts');
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/req\.ip \|\| 'unknown-ip'/g, "req.ip ? ipKeyGenerator(req, res) : 'unknown-ip'");
fs.writeFileSync(file, content);
console.log('Patched');
