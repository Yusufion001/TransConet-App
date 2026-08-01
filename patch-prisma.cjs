const fs = require('fs');
let code = fs.readFileSync('src/db/prisma.ts', 'utf8');
code = code.replace(
  "const connectionString = process.env.DATABASE_URL;\nconst pool = new Pool({ connectionString });",
  `const rawConnectionString = process.env.DATABASE_URL || '';\nconst connectionString = rawConnectionString.replace(/[?&]sslmode=[^&]+/g, '');\nconst pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });`
);
fs.writeFileSync('src/db/prisma.ts', code);
