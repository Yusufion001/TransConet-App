import fs from 'fs';

let content = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Add indexes to Transaction
if (!content.includes("@@index([loadId])") && content.includes("model Transaction {")) {
  content = content.replace(
    '  @@schema("public")\n}',
    '  @@index([loadId])\n  @@index([shipperId])\n  @@index([transporterId])\n  @@schema("public")\n}'
  );
}

// Add indexes to Bid
if (!content.includes("@@index([driverId])") && content.includes("model Bid {")) {
  content = content.replace(
    /model Bid \{[^}]*@@schema\("public"\)\n\}/m,
    (match) => match.replace('  @@schema("public")\n}', '  @@index([loadId])\n  @@index([driverId])\n  @@schema("public")\n}')
  );
}

fs.writeFileSync('prisma/schema.prisma', content);
