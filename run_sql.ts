import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function run() {
  try {
    const sql = fs.readFileSync('enable_rls.sql', 'utf8');
    await prisma.$executeRawUnsafe(sql);
    console.log("Successfully enabled RLS on all tables.");
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
run();
