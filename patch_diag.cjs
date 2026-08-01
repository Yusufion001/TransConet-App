const fs = require('fs');
let code = fs.readFileSync('src/utils/diagnostics.ts', 'utf8');

code = code.replace(
  "const prisma = new PrismaClient({\n      datasources: { db: { url: dbUrl } }\n    });",
  "const { Pool } = require('pg');\n    const { PrismaPg } = require('@prisma/adapter-pg');\n    const pool = new Pool({ connectionString: dbUrl });\n    const adapter = new PrismaPg(pool);\n    const prisma = new PrismaClient({ adapter });"
);

fs.writeFileSync('src/utils/diagnostics.ts', code);
