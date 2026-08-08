import path from 'path';
import dotenv from 'dotenv';

// Load local environment files without overriding values injected by Render,
// CI, or another runtime environment.
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: false });
dotenv.config({ path: path.resolve(process.cwd(), '../.env'), override: false });
dotenv.config({ override: false });

// Fallbacks for test environments when .env is not present.
if (process.env.NODE_ENV === 'test') {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_12345';
  process.env.ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'test_admin_jwt_secret_key_12345';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/test_db';
}

const requiredEnvVars = [
  'JWT_SECRET',
  'ADMIN_JWT_SECRET',
  'DATABASE_URL'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    if (process.env.NODE_ENV === 'test') {
      console.warn(`⚠️ Warning: Missing ${envVar} during testing.`);
    } else {
      console.error(`🚨 FATAL ERROR: Missing required environment variable: ${envVar}`);
      process.exit(1);
    }
  }
}

// Render supplies PORT at runtime. Always prefer it over BACKEND_PORT so the
// service binds to the port expected by the hosting platform.
const runtimePort = Number.parseInt(process.env.PORT || '', 10);
const configuredPort = Number.parseInt(process.env.BACKEND_PORT || '', 10);
const port = Number.isFinite(runtimePort) && runtimePort > 0
  ? runtimePort
  : Number.isFinite(configuredPort) && configuredPort > 0
    ? configuredPort
    : 3000;

export const config = {
  jwtSecret: (process.env.JWT_SECRET || 'test_jwt_secret_key_12345') as string,
  adminJwtSecret: (process.env.ADMIN_JWT_SECRET || 'test_admin_jwt_secret_key_12345') as string,
  databaseUrl: (process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/test_db') as string,
  port,
};
