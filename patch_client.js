const fs = require('fs');
let code = fs.readFileSync('src/api/client.ts', 'utf8');
code = code.replace("baseURL: '/api',", "baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',");
code = code.replace("const response = await fetch('/api/csrf-token'", "const baseUrl = import.meta.env.VITE_API_URL || '';\n    const response = await fetch(`${baseUrl}/api/csrf-token`");
fs.writeFileSync('src/api/client.ts', code);
