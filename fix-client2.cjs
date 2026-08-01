const fs = require('fs');
const file = 'src/api/client.ts';
let content = fs.readFileSync(file, 'utf8');

// Ensure baseURL uses Railway if running on Vercel and VITE_API_URL is not set or set incorrectly
content = content.replace(
  /baseURL: \(import\.meta\.env\.VITE_API_URL \?\?\?\)/, // wait, let's just do a string replace
  '' 
);
