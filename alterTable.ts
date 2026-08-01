import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  await prisma.$executeRawUnsafe('ALTER TABLE "TransporterProfile" ALTER COLUMN embedding TYPE vector(3072);');
  await prisma.$executeRawUnsafe('ALTER TABLE "LoadPosting" ALTER COLUMN embedding TYPE vector(3072);');
  console.log('Altered table successfully');
}
run().catch(console.error).finally(() => prisma.$disconnect());
