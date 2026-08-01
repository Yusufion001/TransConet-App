const fs = require('fs');
let content = fs.readFileSync('package.json', 'utf8');
content = content.replace(
  '"prestart": "echo \\"Skipping migrations during boot to prevent pooler hang\\""',
  '"prestart": "npx prisma db push --accept-data-loss || true"'
);
fs.writeFileSync('package.json', content);
console.log('patched package.json');
