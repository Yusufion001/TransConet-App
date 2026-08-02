// src/prestart.ts
import dotenv from 'dotenv';
import path from 'path';
import { execSync } from 'child_process';

// Configure dotenv to read our local clean .env file first

import { fileURLToPath } from 'url';
const getDirname = () => {
  try {
    if (typeof __dirname !== 'undefined') return __dirname;
    return path.dirname(fileURLToPath(import.meta.url));
  } catch (e) {
    return process.cwd();
  }
};
const dir = getDirname();
const envPath = path.resolve(process.cwd(), '.env');
// Ignore dir for now
const _ = dir;
const envPath2 = path.resolve(process.cwd(), '../.env');
dotenv.config({ path: envPath, override: true });
dotenv.config({ path: envPath2, override: true });


function sanitizeDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  
  let cleanUrl = url.trim();
  
  // 1. Try to match the specific double-@ markdown format
  const markdownMatch = cleanUrl.match(/^(postgresql:\/\/|postgres:\/\/)([^:]+):([^@]+)@@\[[^\]]+\]\((https?:\/\/)?([^)]+)\)$/);
  if (markdownMatch) {
    const [, scheme, username, password, , hostAndParams] = markdownMatch;
    return `${scheme}${username}:${password}%40@${hostAndParams}`;
  }
  
  // 2. Fallback to general cleaning if it doesn't match the specific regex
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
    console.log(`🔌 [PRESTART] DATABASE_URL sanitized from markdown format.`);
    process.env.DATABASE_URL = sanitized;
  }

  console.log("🔌 [PRESTART] Verifying database connection credentials synchronously...");
  try {
    const inlineCheckScript = `
      import("@prisma/client").then(async ({ PrismaClient }) => {
        const { Pool } = await import('pg');
        const { PrismaPg } = await import('@prisma/adapter-pg');
        const pool = new Pool({ connectionString: process.env.CHECK_DB_URL.replace(/[?&]sslmode=[^&]+/g, '').replace(/&/, (match, offset, str) => str.indexOf('?') === -1 ? '?' : '&'), ssl: { rejectUnauthorized: false } });
        const adapter = new PrismaPg(pool);
        const prisma = new PrismaClient({ adapter });
        prisma.$queryRawUnsafe("SELECT 1")
          .then(() => process.exit(0))
          .catch(() => process.exit(1));
      }).catch(() => process.exit(1));
    `;
    execSync("node --input-type=module", {
      input: inlineCheckScript,
      timeout: 5000,
      env: { ...process.env, CHECK_DB_URL: process.env.DATABASE_URL },
      stdio: ["pipe", "ignore", "ignore"]
    });
    console.log("✅ [PRESTART] Database connection successfully verified.");
  } catch (error) {
    console.warn("⚠️ [PRESTART] WARNING: Database connection failed (bad credentials or offline server).");
    console.warn("🔌 [PRESTART] Cannot connect to database. Continuing anyway for development...");
    // throw error; // Disabled to allow dev server to start even if DB is offline or invalid credentials
  }
}


