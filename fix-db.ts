import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trigger_dispatch_alert ON "Bid"`);
  await prisma.$executeRawUnsafe(`DROP FUNCTION IF EXISTS handle_bid_update_notification() CASCADE`);
  console.log("Trigger and function dropped.");
}
main().catch(console.error).finally(() => prisma.$disconnect());
