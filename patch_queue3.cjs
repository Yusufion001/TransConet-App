const fs = require('fs');
let content = fs.readFileSync('src/services/queueService.ts', 'utf8');

const brokenPart = '  /* Worker init moved to startWorkers */\n' +
'  try {\n' +
'    const prisma = standardPrisma; \n' +
'    await prisma.$executeRawUnsafe(`\n' +
'      INSERT INTO "OutboxEvent" (id, type, payload, status, "updatedAt") \n' +
'      VALUES (gen_random_uuid(), $1, $2::jsonb, \'PENDING\', now())\n' +
'    `, type, JSON.stringify(payload));\n' +
'    console.log(`[Outbox] Saved ${type} to postgres outbox because redis was unavailable.`);\n' +
'  } catch (error) {\n' +
'    console.error(`[Outbox] Failed to save to outbox:`, error);\n' +
'  }\n' +
'};';

const fixedPart = '  /* Worker init moved to startWorkers */\n' +
'}\n\n' +
'export const saveToOutbox = async (type: string, payload: any) => {\n' +
'  try {\n' +
'    const prisma = standardPrisma; \n' +
'    await prisma.$executeRawUnsafe(`\n' +
'      INSERT INTO "OutboxEvent" (id, type, payload, status, "updatedAt") \n' +
'      VALUES (gen_random_uuid(), $1, $2::jsonb, \'PENDING\', now())\n' +
'    `, type, JSON.stringify(payload));\n' +
'    console.log(`[Outbox] Saved ${type} to postgres outbox because redis was unavailable.`);\n' +
'  } catch (error) {\n' +
'    console.error(`[Outbox] Failed to save to outbox:`, error);\n' +
'  }\n' +
'};';

content = content.replace(brokenPart, fixedPart);
fs.writeFileSync('src/services/queueService.ts', content);
