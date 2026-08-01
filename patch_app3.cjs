const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/App.tsx');
let content = fs.readFileSync(file, 'utf8');

// Fix payload order
content = content.replace("login(token, phone, payload?.email || '');\n    \n    const payload = parseJwt(token);", "const payload = parseJwt(token);\n    login(token, phone, payload?.email || '');");

// Find all isAdmin
content = content.replace(/isAdminAuthorized/g, "isAdmin");

// other states
content = content.replace(/setIsAuthenticated\(true\);/g, "/* set by hook */");
content = content.replace(/setUserEmail\(admin\.email\);/g, "/* set by hook */");

fs.writeFileSync(file, content);
console.log('Patched');
