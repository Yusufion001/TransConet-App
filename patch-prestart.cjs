const fs = require('fs');
let code = fs.readFileSync('src/prestart.ts', 'utf8');
code = code.replace(
  "const pool = new Pool({ connectionString: process.env.CHECK_DB_URL });",
  "const pool = new Pool({ connectionString: process.env.CHECK_DB_URL.replace(/[?&]sslmode=[^&]+/g, ''), ssl: { rejectUnauthorized: false } });"
);
fs.writeFileSync('src/prestart.ts', code);
