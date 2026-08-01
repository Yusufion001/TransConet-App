const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL.replace(/[?&]sslmode=[^&]+/g, '');
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

prisma.user.findFirst().then(console.log).catch(console.error).finally(() => prisma.$disconnect());
