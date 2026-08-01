const fs = require('fs');
let file = 'tests/load-lifecycle.test.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  "const prisma = new PrismaClient();",
  `const url = process.env.DATABASE_URL || '';\nconst testUrl = url.includes('?') ? url + '&pgbouncer=true' : url + '?pgbouncer=true';\nconst prisma = new PrismaClient({ datasources: { db: { url: testUrl } } });`
);
fs.writeFileSync(file, content);
console.log("Patched test file");
