import fs from 'fs';
let content = fs.readFileSync('src/controllers/loadController.ts', 'utf-8');

content = content.replace(
  "await prisma.$executeRawUnsafe(`UPDATE \"LoadPosting\" SET embedding = $1::vector WHERE id = $2`, vectorString, newLoad.id);",
  "const standardPrisma = require('../db/prisma').prisma;\n          await standardPrisma.$executeRawUnsafe(`UPDATE \"LoadPosting\" SET embedding = $1::vector WHERE id = $2`, vectorString, newLoad.id);"
);

fs.writeFileSync('src/controllers/loadController.ts', content);

let content2 = fs.readFileSync('src/controllers/aiOptimizationController.ts', 'utf-8');
content2 = content2.replace(
  "await prisma.$executeRawUnsafe(`UPDATE \"TransporterProfile\" SET embedding = $1::vector WHERE \"userId\" = $2`, vectorString, transporter.userId);",
  "const standardPrisma = require('../db/prisma').prisma;\n          await standardPrisma.$executeRawUnsafe(`UPDATE \"TransporterProfile\" SET embedding = $1::vector WHERE \"userId\" = $2`, vectorString, transporter.userId);"
);
fs.writeFileSync('src/controllers/aiOptimizationController.ts', content2);
