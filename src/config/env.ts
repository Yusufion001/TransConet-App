import dotenv from 'dotenv';

// Load variables from .env file
dotenv.config();

// Define the required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'ADMIN_JWT_SECRET',
  'DATABASE_URL'
  // Removed 'PORT' from required vars to adhere to AI Studio constraints,
  // since the platform hardcodes port 3000 and it may not be in process.env
];

// Verify that all required variables are present
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    // This fatal error prevents the server from starting in a vulnerable state
    console.error(`🚨 FATAL ERROR: Missing required environment variable: ${envVar}`);
    process.exit(1); 
  }
}

export const config = {
  jwtSecret: process.env.JWT_SECRET as string,
  adminJwtSecret: process.env.ADMIN_JWT_SECRET as string,
  databaseUrl: process.env.DATABASE_URL as string,
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
};
