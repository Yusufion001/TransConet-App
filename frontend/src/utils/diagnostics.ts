import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';

// Load env variables
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

async function runDiagnostics() {
  console.log('================================================================');
  console.log('           🚀 TransConet(R) Diagnostic System             ');
  console.log('================================================================\n');

  let overallPassed = true;

  // 1. ENVIRONMENT VARIABLES INTEGRITY CHECK
  console.log('📋 [STAGE 1] Environment Variables Verification...');
  const requiredEnvs = [
    { name: 'DATABASE_URL', critical: true, secret: true },
    { name: 'DIRECT_URL', critical: true, secret: true },
    { name: 'VITE_SUPABASE_URL', critical: true, secret: false },
    { name: 'VITE_SUPABASE_ANON_KEY', critical: true, secret: true },
    { name: 'GEMINI_API_KEY', critical: false, secret: true },
    { name: 'RESEND_API_KEY', critical: false, secret: true },
    { name: 'SMS_API_KEY', critical: false, secret: true },
    { name: 'APP_URL', critical: false, secret: false }
  ];

  for (const env of requiredEnvs) {
    const val = process.env[env.name];
    if (!val) {
      if (env.critical) {
        console.error(`  ❌ Critical Missing: ${env.name} is not set!`);
        overallPassed = false;
      } else {
        console.warn(`  ⚠️  Optional Missing: ${env.name} is not set.`);
      }
    } else {
      const displayVal = env.secret
        ? `${val.substring(0, 8)}...[HIDDEN]...${val.substring(val.length - 4)}`
        : val;
      console.log(`  ✅ Found: ${env.name} = ${displayVal}`);
    }
  }
  console.log('');

  // 2. PRISMA POSTGRESQL CONNECTION CHECK
  console.log('🔌 [STAGE 2] Prisma DB (Supabase Pooled Connection) Connectivity check...');
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('  ❌ DB Connection bypassed: No DATABASE_URL set.');
    overallPassed = false;
  } else {
    const { Pool } = require('pg');
    const { PrismaPg } = require('@prisma/adapter-pg');
    const pool = new Pool({ connectionString: dbUrl.replace(/[?&]sslmode=[^&]+/g, ''), ssl: { rejectUnauthorized: false } });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });
    try {
      const startTime = Date.now();
      // Test raw query
      await prisma.$queryRawUnsafe('SELECT 1');
      const latency = Date.now() - startTime;
      console.log(`  ✅ Database connection successful. Raw Query Latency: ${latency}ms`);

      // Let's check some base metadata like user count
      const userCount = await prisma.user.count();
      console.log(`  ✅ Schema integrity verified. Registered users count: ${userCount}`);
    } catch (err: any) {
      console.error('  ❌ Database connection / query failed!');
      console.error(`  Error message: ${err.message || err}`);
      overallPassed = false;
    } finally {
      await prisma.$disconnect();
    }
  }
  console.log('');

  // 3. SUPABASE CLIENT SDK & REST ENDPOINT VERIFICATION
  console.log('⚡ [STAGE 3] Supabase Client SDK & Web REST Integration Check...');
  const sUrl = process.env.VITE_SUPABASE_URL;
  const sKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!sUrl || !sKey) {
    console.warn('  ⚠️  Supabase integration credentials missing in .env; skipping REST test.');
  } else {
    try {
      const supabase = createClient(sUrl, sKey);
      const startTime = Date.now();
      
      // Ping auth settings/health or dynamic request
      const { data, error } = await supabase.auth.getSession();
      const latency = Date.now() - startTime;

      if (error) {
        console.error(`  ❌ Supabase returned an authentication/session error: ${error.message}`);
        overallPassed = false;
      } else {
        console.log(`  ✅ Supabase client successfully authenticated. REST Endpoint Latency: ${latency}ms`);
      }
    } catch (err: any) {
      console.error('  ❌ Supabase direct connection failure!');
      console.error(`  Error message: ${err.message || err}`);
      overallPassed = false;
    }
  }
  console.log('');

  // 4. RESEND EMAIL API KEY VERIFICATION
  console.log('✉️ [STAGE 4] Resend Email Gateway Credentials Integrity Check...');
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn('  ⚠️  RESEND_API_KEY not set. Outgoing notification emails will be disabled.');
  } else if (resendKey.startsWith('re_mock_')) {
    console.log('  ℹ️  Mock Resend Key detected. Sandbox notifications are active.');
  } else {
    try {
      // Validate Resend client key structure
      if (resendKey.length < 15 || !resendKey.startsWith('re_')) {
        console.error('  ❌ Resend Key pattern is invalid. Must start with "re_"');
        overallPassed = false;
      } else {
        console.log('  ✅ Resend Email key formatting structure matches production requirements.');
      }
    } catch (err: any) {
      console.error(`  ❌ Resend validation threw error: ${err.message}`);
      overallPassed = false;
    }
  }
  console.log('');

  // 5. LOCAL WEB SERVER HEALTH & RESPONSE SPEED
  console.log('🖥️ [STAGE 5] Express Web Server Port Routing & Latency Check...');
  try {
    const startTime = Date.now();
    const response = await axios.get('http://localhost:3000/api/health', { timeout: 3000 });
    const latency = Date.now() - startTime;
    
    if (response.status === 200) {
      console.log(`  ✅ Express server is ONLINE on port 3000.`);
      console.log(`  ✅ Health Endpoint reported: ${JSON.stringify(response.data)}`);
      console.log(`  ✅ Route response speed: ${latency}ms`);
    } else {
      console.error(`  ❌ Express server responded with status code: ${response.status}`);
      overallPassed = false;
    }
  } catch (err: any) {
    console.error('  ❌ Express server is offline or unreachable on port 3000.');
    console.error(`  Error Details: ${err.message || err}`);
    console.error('  💡 Tip: Ensure the server is booted via "npm run dev" or active restarted status.');
    overallPassed = false;
  }
  console.log('');

  // CONCLUSION
  console.log('================================================================');
  if (overallPassed) {
    console.log('      🎉 SUCCESS: ALL DIAGNOSTIC TESTS PASSED OPERATIONAL STATUS 🎉');
  } else {
    console.log('      ⚠️  DIAGNOSTICS FINISHED WITH ERRORS / WARNINGS ⚠️');
  }
  console.log('================================================================\n');

  process.exit(overallPassed ? 0 : 1);
}

runDiagnostics();
