import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('SecureAdmin123!', 10);
  
  await prisma.adminUser.update({
    where: { email: 'admin@transconet.ng' },
    data: { passwordHash, failedLoginAttempts: 0, lockoutUntil: null }
  });
  console.log('Updated admin@transconet.ng password to SecureAdmin123!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
