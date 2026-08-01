import fs from 'fs';

let content = fs.readFileSync('src/controllers/authController.ts', 'utf8');

// Add import for redis
content = content.replace("import { prismaRLS as prisma } from '../db/prisma';", "import { prismaRLS as prisma } from '../db/prisma';\nimport { redis } from '../utils/redis';");

// Remove the in-memory map
content = content.replace("const failedLoginAttempts = new Map<string, { count: number, lockedUntil: number }>();", "// Distributed Redis used for login attempts");

// Update lockoutData get
content = content.replace(
  "const lockoutData = failedLoginAttempts.get(sanitizedPhone);",
  "const lockoutDataStr = await redis.get(`lockout:${sanitizedPhone}`);\n    const lockoutData = lockoutDataStr ? JSON.parse(lockoutDataStr) : null;"
);

// Update lockout data update
content = content.replace(
  "const attempts = (failedLoginAttempts.get(sanitizedPhone)?.count || 0) + 1;\n      if (attempts >= MAX_FAILED_ATTEMPTS) {\n        failedLoginAttempts.set(sanitizedPhone, { count: attempts, lockedUntil: Date.now() + LOCKOUT_DURATION_MS });\n        return res.status(429).json({ error: 'Account locked due to too many failed login attempts. Please try again later.' });\n      } else {\n        failedLoginAttempts.set(sanitizedPhone, { count: attempts, lockedUntil: 0 });\n      }",
  `const attemptsDataStr = await redis.get(\`login_attempts:\${sanitizedPhone}\`);
      const attempts = (attemptsDataStr ? parseInt(attemptsDataStr) : 0) + 1;
      if (attempts >= MAX_FAILED_ATTEMPTS) {
        await redis.setex(\`lockout:\${sanitizedPhone}\`, LOCKOUT_DURATION_MS / 1000, JSON.stringify({ count: attempts, lockedUntil: Date.now() + LOCKOUT_DURATION_MS }));
        return res.status(429).json({ error: 'Account locked due to too many failed login attempts. Please try again later.' });
      } else {
        await redis.setex(\`login_attempts:\${sanitizedPhone}\`, 15 * 60, attempts.toString());
      }`
);

// Update successful login clear
content = content.replace(
  "failedLoginAttempts.delete(sanitizedPhone); // Reset on success",
  "await redis.del(`login_attempts:${sanitizedPhone}`);\n    if (redis.del) await redis.del(`lockout:${sanitizedPhone}`);"
);

fs.writeFileSync('src/controllers/authController.ts', content);
