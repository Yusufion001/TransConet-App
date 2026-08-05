// src/prestart.ts
import dotenv from 'dotenv';
import path from 'path';
import { execSync } from 'child_process';

// Load local .env files only when a variable is not already supplied by the
// hosting environment. Render/Railway environment variables must take priority.
const envPath = path.resolve(process.cwd(), '.env');
const envPath2 = path.resolve(process.cwd(), '../.env');
dotenv.config({ path: envPath, override: false });
dotenv.config({ path: envPath2, override: false });

function sanitizeDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url;

  let cleanUrl = url.trim();

  // Repair the accidental markdown-style connection-string format that has
  // previously appeared in environment variables.
  const markdownMatch = cleanUrl.match(/^(postgresql:\/\/|postgres:\/\/)([^:]+):([^@]+)@@\[[^\]]+\]\((https?:\/\/)?([^)]+)\)$/);
  if (markdownMatch) {
    const [, scheme, username, password, , hostAndParams] = markdownMatch;
    return `${scheme}${username}:${password}%40@${hostAndParams}`;
  }

  if (cleanUrl.endsWith(')')) {
    const parenIndex = cleanUrl.lastIndexOf('](');
    if (parenIndex !== -1) {
      cleanUrl = cleanUrl.substring(parenIndex + 2, cleanUrl.length - 1);
    }
  }

  cleanUrl = cleanUrl.replace(/[\[\]]/g, '');
  if (cleanUrl.includes('@@')) {
    cleanUrl = cleanUrl.replace('@@', '%40@');
  }

  if (cleanUrl.startsWith('http://')) {
    cleanUrl = 'postgresql://' + cleanUrl.substring(7);
  } else if (cleanUrl.startsWith('https://')) {
    cleanUrl = 'postgresql://' + cleanUrl.substring(8);
  }

  return cleanUrl;
}

if (process.env.DATABASE_URL) {
  const original = process.env.DATABASE_URL;
  const sanitized = sanitizeDatabaseUrl(original);

  if (original !== sanitized) {
    console.log('🔌 [PRESTART] DATABASE_URL sanitized from malformed format.');
    process.env.DATABASE_URL = sanitized;
  }

  console.log('🔌 [PRESTART] Verifying database connection credentials synchronously...');

  try {
    const inlineCheckScript = `
      import('@prisma/client').then(async ({ PrismaClient }) => {
        const { Pool } = await import('pg');
        const { PrismaPg } = await import('@prisma/adapter-pg');

        const connectionString = process.env.CHECK_DB_URL
          .replace(/[?&]sslmode=[^&]+/g, '')
          .replace(/&/, (match, offset, str) => str.indexOf('?') === -1 ? '?' : '&');

        const pool = new Pool({
          connectionString,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 5000,
        });

        const adapter = new PrismaPg(pool);
        const prisma = new PrismaClient({ adapter });

        try {
          await prisma.$queryRawUnsafe('SELECT 1');
          await prisma.$disconnect();
          await pool.end();
          process.exit(0);
        } catch (error) {
          const code = error?.code || error?.cause?.code || 'UNKNOWN_DB_ERROR';
          console.error('[PRESTART] Database check failed with code:', code);
          await prisma.$disconnect().catch(() => undefined);
          await pool.end().catch(() => undefined);
          process.exit(1);
        }
      }).catch((error) => {
        console.error('[PRESTART] Database check bootstrap failed:', error?.code || error?.message || 'UNKNOWN_ERROR');
        process.exit(1);
      });
    `;

    execSync('node --input-type=module', {
      input: inlineCheckScript,
      timeout: 10000,
      env: { ...process.env, CHECK_DB_URL: process.env.DATABASE_URL },
      stdio: 'inherit',
    });

    console.log('✅ [PRESTART] Database connection successfully verified.');
  } catch (error: any) {
    const code = error?.status || error?.code || 'UNKNOWN_DB_ERROR';
    console.warn(`⚠️ [PRESTART] Database connection check failed (${code}).`);
    console.warn('🔌 [PRESTART] Server will continue starting; database-backed requests may fail until DATABASE_URL is corrected.');
  }
}
