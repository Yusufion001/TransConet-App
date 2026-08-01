const fs = require('fs');
let code = fs.readFileSync('src/prestart.ts', 'utf8');

code = code.replace(
  "import(\"@prisma/client\").then(({ PrismaClient }) => {",
  "import(\"@prisma/client\").then(async ({ PrismaClient }) => {"
);

fs.writeFileSync('src/prestart.ts', code);
