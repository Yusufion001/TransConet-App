const fs = require('fs');
let code = fs.readFileSync('src/services/queueService.ts', 'utf8');

code = code.replace(
  "export const startOutboxWorker = () => {",
  `let isDbCircuitBreakerOpen = false;
let dbCircuitBreakerResetTime = 0;

export const startOutboxWorker = () => {`
);

code = code.replace(
  "    try {\n      const prisma = standardPrisma;",
  `    if (isDbCircuitBreakerOpen && Date.now() < dbCircuitBreakerResetTime) return;
    isDbCircuitBreakerOpen = false;
    try {
      const prisma = standardPrisma;`
);

code = code.replace(
  "      console.error('[Outbox Worker] Error fetching pending events:', err);\n    }",
  `      // Simple circuit breaker to prevent spamming logs and tripping database lockout
      isDbCircuitBreakerOpen = true;
      dbCircuitBreakerResetTime = Date.now() + 60000; // Pause for 60 seconds
      // Optional: Only log if we are debugging or every so often.
      // console.error('[Outbox Worker] DB unreachable, pausing outbox for 60s. Error:', err.message);
    }`
);

fs.writeFileSync('src/services/queueService.ts', code);
