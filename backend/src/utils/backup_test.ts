import { prisma } from '../db/prisma';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

async function runBackupTest() {
  console.log('================================================================');
  console.log('           📦 TransConet(R) Backup System Test            ');
  console.log('================================================================\n');

  
  const backupDir = path.resolve(process.cwd(), 'backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log(`  ✅ Created backup directory at: ${backupDir}`);
  }

  try {
    console.log('  ⏳ Starting data extraction...');
    
    const startTime = Date.now();
    const users = await prisma.user.findMany();
    const loadPostings = await prisma.loadPosting.findMany();
    const vehicles = await prisma.vehicle.findMany();
    const supportTickets = await prisma.supportTicket.findMany();
    
    const backupData = {
      timestamp: new Date().toISOString(),
      metadata: {
        totalUsers: users.length,
        totalLoadPostings: loadPostings.length,
        totalVehicles: vehicles.length,
        totalSupportTickets: supportTickets.length,
      },
      data: {
        users,
        loadPostings,
        vehicles,
        supportTickets
      }
    };

    const fileName = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filePath = path.join(backupDir, fileName);
    
    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
    
    const latency = Date.now() - startTime;
    console.log(`  ✅ Backup completed successfully in ${latency}ms.`);
    console.log(`  ✅ Backup file saved to: ${filePath}`);
    console.log(`  📊 Backup Summary:`);
    console.log(`     - Users: ${users.length}`);
    console.log(`     - Load Postings: ${loadPostings.length}`);
    console.log(`     - Vehicles: ${vehicles.length}`);
    console.log(`     - Support Tickets: ${supportTickets.length}`);
    console.log('');
    console.log('================================================================');
    console.log('      🎉 SUCCESS: BACKUP TEST PASSED OPERATIONAL STATUS 🎉');
    console.log('================================================================\n');
  } catch (err: any) {
    console.error('  ❌ Backup failed!');
    console.error(`  Error message: ${err.message || err}`);
    console.log('================================================================');
    console.log('      ⚠️  BACKUP TEST FINISHED WITH ERRORS ⚠️');
    console.log('================================================================\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runBackupTest();
