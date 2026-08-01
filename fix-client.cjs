const fs = require('fs');
const file = 'src/api/client.ts';
let content = fs.readFileSync(file, 'utf8');

// Replace baseURL logic
content = content.replace(
  /baseURL:\s*\(import\.meta\.env\.VITE_API_URL\s*&&\s*import\.meta\.env\.VITE_API_URL\s*!==\s*'undefined'\s*&&\s*import\.meta\.env\.VITE_API_URL\s*!==\s*'null'\)\s*\?\s*import\.meta\.env\.VITE_API_URL\s*:\s*'\/api',/,
  `baseURL: (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'undefined' && import.meta.env.VITE_API_URL !== 'null') ? (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : import.meta.env.VITE_API_URL.replace(/\\/$/, '') + '/api') : '/api',`
);

fs.writeFileSync(file, content);
console.log("Fixed client.ts");
