const { Pool } = require('pg');
const url = process.env.DATABASE_URL.replace(/sslmode=[^&]+/, '');
const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
pool.query('SELECT 1').then(() => console.log('Success')).catch(e => console.error(e.message)).finally(() => pool.end());
