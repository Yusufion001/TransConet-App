import fs from 'fs';

let content = fs.readFileSync('src/controllers/loadController.ts', 'utf-8');
content = content.replace("const standardPrisma = require('../db/prisma').prisma;", "const standardPrisma = require('../db/prisma').prisma;");
// wait, instead of require, let's use the import
content = content.replace("import { prismaRLS } from '../db/prisma';", "import { prismaRLS, prisma as standardPrisma } from '../db/prisma';");
content = content.replace("const standardPrisma = require('../db/prisma').prisma;\n", "");
fs.writeFileSync('src/controllers/loadController.ts', content);

let content2 = fs.readFileSync('src/controllers/aiOptimizationController.ts', 'utf-8');
content2 = content2.replace("import { prismaRLS } from '../db/prisma';", "import { prismaRLS, prisma as standardPrisma } from '../db/prisma';");
content2 = content2.replace("const standardPrisma = require('../db/prisma').prisma;\n", "");
fs.writeFileSync('src/controllers/aiOptimizationController.ts', content2);

let content3 = fs.readFileSync('src/services/queueService.ts', 'utf-8');
content3 = content3.replace("const prisma = prismaRLS || require('../db/prisma').prisma;", "const prisma = prismaRLS; // use standard if RLS not needed, but RLS works fine, wait.");
// wait, in queueService:
// it says const prisma = prismaRLS || require('../db/prisma').prisma;
// let's replace that with importing standardPrisma
content3 = content3.replace("import { prismaRLS } from '../db/prisma';", "import { prismaRLS, prisma as standardPrisma } from '../db/prisma';");
content3 = content3.replace("const prisma = prismaRLS || require('../db/prisma').prisma;", "const prisma = standardPrisma;");
fs.writeFileSync('src/services/queueService.ts', content3);

