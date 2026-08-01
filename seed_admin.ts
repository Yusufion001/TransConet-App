import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = 'admin@transconet.ng';
  const password = 'SecureAdmin123!';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash: hashedPassword, role: 'SUPER_ADMIN', isActive: true },
    create: {
      email,
      passwordHash: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
      lastLoginAt: new Date()
    }
  });
  console.log('Seeded admin:', admin.email);
}

seedAdmin().catch(console.error).finally(() => prisma.$disconnect());
