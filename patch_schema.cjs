const fs = require('fs');
let content = fs.readFileSync('src/schemas/paymentSchemas.ts', 'utf8');

content = content.replace(
  "    driverId: z.string().optional()",
  "    transporterId: z.string().min(1),\n    shipperId: z.string().min(1),\n    payoutAmount: z.number().positive()"
);
fs.writeFileSync('src/schemas/paymentSchemas.ts', content);
