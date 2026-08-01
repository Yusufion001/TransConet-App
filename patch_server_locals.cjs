const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/server.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace("res.locals.csrfToken", "res.locals?.csrfToken");

fs.writeFileSync(file, content);
console.log('Patched server');
