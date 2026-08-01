const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('SecureAdmin123!', 10);
  
  await prisma.adminUser.upsert({
    where: { email: 'admin@transconet.ng' },
    update: {
      passwordHash,
      role: 'SUPER_ADMIN'
    },
    create: {
      email: 'admin@transconet.ng',
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true
    }
  });
  console.log('Admin seeded successfully.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
