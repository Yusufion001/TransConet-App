const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    const sql = require('fs').readFileSync('enable_rls.sql', 'utf8');
    await client.query(sql);
    console.log("Successfully enabled RLS on all tables.");
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
