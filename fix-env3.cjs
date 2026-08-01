const fs = require('fs');
let content = fs.readFileSync('src/config/env.ts', 'utf8');

content = content.replace(
  /port: process\.env\.NODE_ENV === 'production'.*/,
  `port: process.env.NODE_ENV === 'production' ? (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000) : 3000,`
);

fs.writeFileSync('src/config/env.ts', content);
console.log("Fixed env.ts");
