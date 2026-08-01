import fs from 'fs';

let content = fs.readFileSync('src/controllers/loadController.ts', 'utf-8');
content = content.replace(
  "import { prismaRLS as prisma } from '../db/prisma';",
  "import { prismaRLS as prisma, prisma as standardPrisma } from '../db/prisma';"
);
fs.writeFileSync('src/controllers/loadController.ts', content);

let content2 = fs.readFileSync('src/controllers/aiOptimizationController.ts', 'utf-8');
content2 = content2.replace(
  "import { prismaRLS } from '../db/prisma';",
  "import { prismaRLS, prisma as standardPrisma } from '../db/prisma';"
);
fs.writeFileSync('src/controllers/aiOptimizationController.ts', content2);
