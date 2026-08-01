const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/server.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace("res.locals.nonce =", "(res as any).locals.nonce =");
content = content.replace("res.locals.nonce", "(res as any).locals.nonce");
content = content.replace("res.locals.nonce", "(res as any).locals.nonce");

fs.writeFileSync(file, content);
console.log('Patched server');
