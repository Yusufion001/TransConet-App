import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log("Checking current admins...");
  const admins = await prisma.adminUser.findMany();
  
  const keepEmails = [
    'superadmin@transconet.com',
    'backupadmin@transconet.com',
    'yusufjimoh969@gmail.com',
    'platform@transconet.com',
    'finance@transconet.com',
    'support@transconet.com',
    'compliance@transconet.com'
  ];

  const keepRoles = {
    'superadmin@transconet.com': 'SUPER_ADMIN',
    'backupadmin@transconet.com': 'SUPER_ADMIN',
    'yusufjimoh969@gmail.com': 'DEVELOPER',
    'platform@transconet.com': 'PLATFORM_ADMIN',
    'finance@transconet.com': 'FINANCE_ADMIN',
    'support@transconet.com': 'SUPPORT_ADMIN',
    'compliance@transconet.com': 'COMPLIANCE_ADMIN'
  };
  
  for (const admin of admins) {
    const emailLower = admin.email.toLowerCase();
    
    if (admin.email !== emailLower) {
      console.log(`Normalizing email: ${admin.email} -> ${emailLower}`);
      const existing = await prisma.adminUser.findUnique({ where: { email: emailLower } });
      if (existing && existing.id !== admin.id) {
         console.log(`- Duplicate found, marking ${admin.email} inactive`);
         await prisma.adminUser.update({
            where: { id: admin.id },
            data: { isActive: false, email: `${admin.email}_archived_${Date.now()}` }
         });
      } else {
         await prisma.adminUser.update({
            where: { id: admin.id },
            data: { email: emailLower }
         });
      }
    }
    
    if (!keepEmails.includes(emailLower) && admin.isActive) {
      console.log(`Archiving legacy admin: ${emailLower}`);
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { isActive: false }
      });
    }
  }

  console.log("Upserting required enterprise admins...");
  const passwordHash = await bcrypt.hash('SecureAdmin123!', 10);
  
  for (const email of keepEmails) {
    const role = keepRoles[email as keyof typeof keepRoles] as any;
    
    await prisma.adminUser.upsert({
      where: { email },
      update: {
        role,
        isActive: true
      },
      create: {
        email,
        passwordHash,
        role,
        isActive: true
      }
    });
    console.log(`- Upserted ${email} as ${role}`);
  }
  
  console.log("Cleanup and seeding complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
