import fs from 'fs';

let content = fs.readFileSync('src/middleware/rateLimiter.ts', 'utf8');

content = content.replace(
  '      redis: Redis.fromEnv(),',
  '      redis: new Redis({ url: process.env.UPSTASH_REDIS_REST_URL?.replace(/"/g, "") || "", token: process.env.UPSTASH_REDIS_REST_TOKEN?.replace(/"/g, "") || "" }),'
);

fs.writeFileSync('src/middleware/rateLimiter.ts', content);
