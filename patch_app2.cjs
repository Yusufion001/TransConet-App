const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/App.tsx');
let content = fs.readFileSync(file, 'utf8');

// Also fix isAdminAuthorized in App.tsx
content = content.replace(/isAdminAuthorized/g, "isAdmin");

fs.writeFileSync(file, content);
console.log('Patched isAdmin');
