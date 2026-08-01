const fs = require('fs');
let content = fs.readFileSync('package.json', 'utf8');
content = content.replace(
  /"prestart": "npx prisma migrate deploy",/,
  '"prestart": "echo \\"Skipping migrations during boot to prevent pooler hang\\"",'
);
fs.writeFileSync('package.json', content);
console.log("Patched package.json");
