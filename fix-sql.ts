import { config } from 'dotenv';
config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  await prisma.$executeRawUnsafe(`
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('driver-documents', 'driver-documents', true)
    ON CONFLICT (id) DO NOTHING;
  `);
  await prisma.$executeRawUnsafe(`
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('operational-media', 'operational-media', true)
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log('SQL executed');
  await prisma.$disconnect();
}
run();
