const fs = require('fs');
const file = 'src/api/client.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  ` : '/api',`,
  ` : (import.meta.env.MODE === 'production' ? 'https://transconet-app-production-0e65.up.railway.app/api' : '/api'),`
);

fs.writeFileSync(file, content);
console.log("Fixed client.ts fallback");
