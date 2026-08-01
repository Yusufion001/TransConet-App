const fs = require('fs');

// Patch server.ts
let serverContent = fs.readFileSync('src/server.ts', 'utf8');
serverContent = serverContent.replace(
  "if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.run.app') || origin.endsWith('.cloudshell.dev')) {",
  "if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.run.app') || origin.endsWith('.cloudshell.dev') || origin.endsWith('.railway.app') || origin.includes('railway')) {"
);
fs.writeFileSync('src/server.ts', serverContent);
console.log('patched server.ts');

// Patch socket.ts
let socketContent = fs.readFileSync('src/socket.ts', 'utf8');
socketContent = socketContent.replace(
  "origin: process.env.NODE_ENV === 'production' \n        ? ['https://transconet.com', 'https://www.transconet.com', 'https://transconet.ng', 'https://www.transconet.ng', 'https://transconet.ng', 'https://www.transconet.ng'] \n        : '*',",
  "origin: process.env.NODE_ENV === 'production' \n        ? ['https://transconet.com', 'https://www.transconet.com', 'https://transconet.ng', 'https://www.transconet.ng', 'https://transconet.ng', 'https://www.transconet.ng'] \n        : '*',"
);

// Wait, actually let's just make it allow '*' or add railway origins.
// Or we can dynamically check in a function.
// Let's replace the whole cors block in socket.ts:
socketContent = socketContent.replace(
  /origin: process\.env\.NODE_ENV === 'production'[\s\S]*?\*',\n      methods: \['GET', 'POST'\],/m,
  "origin: (origin, callback) => {\n        if (!origin || origin.includes('transconet') || origin.includes('railway') || origin.endsWith('.run.app') || origin.endsWith('.cloudshell.dev') || origin.includes('localhost')) {\n          callback(null, true);\n        } else {\n          callback(null, false);\n        }\n      },\n      methods: ['GET', 'POST'],"
);

fs.writeFileSync('src/socket.ts', socketContent);
console.log('patched socket.ts');
