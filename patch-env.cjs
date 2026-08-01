const fs = require('fs');
let content = fs.readFileSync('src/config/env.ts', 'utf8');

// Ensure port defaults to 3000 in AI Studio dev, but uses PORT in production environments like Railway if needed.
// Actually, let's just make sure it's 3000 for AI Studio, but since they deploy to Railway, they need process.env.PORT.
// Wait, the EADDRINUSE 0.0.0.0:8080 implies another process is ALREADY listening on 8080.
content = content.replace(
  /port: process\.env\.PORT \? parseInt\(process\.env\.PORT, 10\) : 3000,/,
  `port: process.env.RAILWAY_ENVIRONMENT ? (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000) : 3000,`
);

fs.writeFileSync('src/config/env.ts', content);
console.log("Patched env.ts");
