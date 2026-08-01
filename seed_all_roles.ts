import { PrismaClient, AdminRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('SecureAdmin123!', 10);
  
  const roles = [
    { email: 'super@transconet.ng', role: 'SUPER_ADMIN' },
    { email: 'platform@transconet.ng', role: 'PLATFORM_ADMIN' },
    { email: 'compliance@transconet.ng', role: 'COMPLIANCE_ADMIN' },
    { email: 'finance@transconet.ng', role: 'FINANCE_ADMIN' },
    { email: 'support@transconet.ng', role: 'SUPPORT_ADMIN' },
    { email: 'developer@transconet.ng', role: 'DEVELOPER' },
  ];

  for (const r of roles) {
    await prisma.adminUser.upsert({
      where: { email: r.email },
      update: {
        passwordHash,
        role: r.role as AdminRole,
        isActive: true
      },
      create: {
        email: r.email,
        passwordHash,
        role: r.role as AdminRole,
        isActive: true
      }
    });
  }
  
  console.log('All admin roles seeded successfully.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
