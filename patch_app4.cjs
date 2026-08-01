const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/App.tsx');
let content = fs.readFileSync(file, 'utf8');

// The original code probably used a different variable for checking admin
content = content.replace(/isAdmin \?/g, "activeRole.includes('ADMIN') ?");
content = content.replace(/isAdmin=\{isAdmin\}/g, "isAdmin={activeRole.includes('ADMIN')}");

fs.writeFileSync(file, content);
console.log('Patched admin checks');
