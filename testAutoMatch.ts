import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const load = await prisma.loadPosting.findFirst();
  if (!load) {
    console.log('No loads found');
    return;
  }
  
  const res = await fetch(`http://localhost:3000/api/ai/match/${load.id}`, {
    method: 'POST'
  });
  console.log(await res.json());
}
run().catch(console.error).finally(() => prisma.$disconnect());
