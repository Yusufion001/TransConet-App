const fs = require('fs');
let code = fs.readFileSync('src/controllers/aiOptimizationController.ts', 'utf8');

code = code.replace(/import prisma from '\.\.\/utils\/prismaClient';/, "");
code = code.replace(/if \(prisma\)/g, "if (false)"); // Since there is no prisma client

fs.writeFileSync('src/controllers/aiOptimizationController.ts', code);
