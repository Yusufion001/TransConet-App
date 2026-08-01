const fs = require('fs');
let content = fs.readFileSync('src/services/queueService.ts', 'utf8');

const brokenPart = `  /* Worker init moved to startWorkers */
}

export const saveToOutbox = async (type: string, payload: any) => {
  try {
    const prisma = standardPrisma; 
    await prisma.$executeRawUnsafe(\`
      INSERT INTO "OutboxEvent" (id, type, payload, status, "updatedAt") 
      VALUES (gen_random_uuid(), $1, $2::jsonb, 'PENDING', now())
    \`, type, JSON.stringify(payload));
    console.log(\`[Outbox] Saved \${type} to postgres outbox because redis was unavailable.\`);
  } catch (error) {
    console.error(\`[Outbox] Failed to save to outbox:\`, error);
  }
};`;

const originalPart = `  /* Worker init moved to startWorkers */
  try {
    const prisma = standardPrisma; 
    await prisma.$executeRawUnsafe(\`
      INSERT INTO "OutboxEvent" (id, type, payload, status, "updatedAt") 
      VALUES (gen_random_uuid(), $1, $2::jsonb, 'PENDING', now())
    \`, type, JSON.stringify(payload));
    console.log(\`[Outbox] Saved \${type} to postgres outbox because redis was unavailable.\`);
  } catch (error) {
    console.error(\`[Outbox] Failed to save to outbox:\`, error);
  }
};`;

if (content.includes(brokenPart)) {
  content = content.replace(brokenPart, `  /* Worker init moved to startWorkers */\n}\n\nexport const saveToOutbox = async (type: string, payload: any) => {\n  try {\n    const prisma = standardPrisma; \n    await prisma.$executeRawUnsafe(\`\n      INSERT INTO "OutboxEvent" (id, type, payload, status, "updatedAt") \n      VALUES (gen_random_uuid(), $1, $2::jsonb, 'PENDING', now())\n    \`, type, JSON.stringify(payload));\n    console.log(\`[Outbox] Saved \${type} to postgres outbox because redis was unavailable.\`);\n  } catch (error) {\n    console.error(\`[Outbox] Failed to save to outbox:\`, error);\n  }\n};`);
} else if (content.includes(originalPart)) {
  content = content.replace(originalPart, `  /* Worker init moved to startWorkers */\n}\n\nexport const saveToOutbox = async (type: string, payload: any) => {\n  try {\n    const prisma = standardPrisma; \n    await prisma.$executeRawUnsafe(\`\n      INSERT INTO "OutboxEvent" (id, type, payload, status, "updatedAt") \n      VALUES (gen_random_uuid(), $1, $2::jsonb, 'PENDING', now())\n    \`, type, JSON.stringify(payload));\n    console.log(\`[Outbox] Saved \${type} to postgres outbox because redis was unavailable.\`);\n  } catch (error) {\n    console.error(\`[Outbox] Failed to save to outbox:\`, error);\n  }\n};`);
}

fs.writeFileSync('src/services/queueService.ts', content);
