const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/FloatingNavHub.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace("isAdminAuthorized: boolean;", "isAdmin?: boolean;\n  isAdminAuthorized?: boolean;");

fs.writeFileSync(file, content);
console.log('Patched nav');
