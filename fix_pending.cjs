const fs = require('fs');
let content = fs.readFileSync('src/services/queueService.ts', 'utf8');
content = content.replace(/PENDING\\, now\(\)\)\\/g, "'PENDING', now())\n");
fs.writeFileSync('src/services/queueService.ts', content);
