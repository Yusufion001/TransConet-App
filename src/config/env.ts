import dotenv from 'dotenv';

// Load variables from .env file
dotenv.config();

// Fallbacks for test environment when .env is not present (e.g. in CI)
if (process.env.NODE_ENV === 'test') {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_12345';
  process.env.ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'test_admin_jwt_secret_key_12345';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/test_db';
}

// Define the required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'ADMIN_JWT_SECRET',
  'DATABASE_URL'
];

// Verify that all required variables are present
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    if (process.env.NODE_ENV === 'test') {
      console.warn(`⚠️ Warning: Missing ${envVar} during testing.`);
    } else {
      // This fatal error prevents the server from starting in a vulnerable state
      console.error(`🚨 FATAL ERROR: Missing required environment variable: ${envVar}`);
      process.exit(1); 
    }
  }
}

export const config = {
  jwtSecret: (process.env.JWT_SECRET || 'test_jwt_secret_key_12345') as string,
  adminJwtSecret: (process.env.ADMIN_JWT_SECRET || 'test_admin_jwt_secret_key_12345') as string,
  databaseUrl: (process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/test_db') as string,
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
};
