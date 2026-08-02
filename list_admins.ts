import { PrismaClient, AdminRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.adminUser.findMany();
  console.log("Current admins:");
  console.log(admins.map(a => `${a.email} (${a.role}) [Active: ${a.isActive}]`));
}
main().catch(console.error).finally(() => prisma.$disconnect());
