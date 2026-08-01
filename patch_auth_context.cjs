const fs = require('fs');
let code = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

code = code.replace(/console\.error\('Error fetching role:', error\);/g, "// console.error('Error fetching role:', error);");
code = code.replace(/console\.error\('Failed to fetch role', err\);/g, "// console.error('Failed to fetch role', err);");

fs.writeFileSync('src/context/AuthContext.tsx', code);
