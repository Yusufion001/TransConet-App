const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf8');

// Remove existing body blocks and dark body blocks
content = content.replace(/body\s*\{[^}]*\}/g, '');
content = content.replace(/\.dark\s*body\s*\{[^}]*\}/g, '');
content = content.replace(/html\.dark\s*\{[^}]*\}/g, '');

// Append correct ones before MOBILE SIMULATOR
const correctBody = `
body {
  background-color: #ffffff;
  color: #1F2937;
}

.dark body {
  background-color: #020617; /* slate-950 */
  color: #f8fafc; /* slate-50 */
}
`;

content = content.replace('/* ==========================================', correctBody + '\n/* ==========================================');

fs.writeFileSync('src/index.css', content);
