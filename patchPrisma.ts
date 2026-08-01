import fs from 'fs';
let content = fs.readFileSync('src/db/prisma.ts', 'utf-8');

// Replace the null fallback
content = content.replace(
  /export const prisma = \(process\.env\.DATABASE_URL && !process\.env\.DATABASE_URL\.includes\("localhost"\)\)\s*\?\s*\(globalForPrisma\.prisma \|\| new PrismaClient\(\)\)\s*:\s*null;/g,
  "export const prisma = globalForPrisma.prisma || new PrismaClient();"
);

content = content.replace(/const prismaRLS = prisma \? prisma\.\$extends\(/, "const prismaRLS = prisma.$extends(");
content = content.replace(/\) : null;/, ");");

fs.writeFileSync('src/db/prisma.ts', content);
