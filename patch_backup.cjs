const fs = require('fs');
let code = fs.readFileSync('src/utils/backup_test.ts', 'utf8');

code = code.replace(
  "import { PrismaClient } from '@prisma/client';",
  "import { prisma } from '../db/prisma';"
);
code = code.replace(
  "const prisma = new PrismaClient();",
  ""
);

fs.writeFileSync('src/utils/backup_test.ts', code);
