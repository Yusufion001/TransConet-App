const fs = require('fs');
let content = fs.readFileSync('src/config/env.ts', 'utf8');

content = content.replace(
  /port: .*?,/,
  `port: process.env.NODE_ENV === 'production' ? (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000) : 3000,`
);

fs.writeFileSync('src/config/env.ts', content);
console.log("Patched env.ts port");
