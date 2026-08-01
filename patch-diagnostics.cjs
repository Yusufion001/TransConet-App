const fs = require('fs');
let code = fs.readFileSync('src/utils/diagnostics.ts', 'utf8');
code = code.replace(
  "const pool = new Pool({ connectionString: dbUrl });",
  "const pool = new Pool({ connectionString: dbUrl.replace(/[?&]sslmode=[^&]+/g, ''), ssl: { rejectUnauthorized: false } });"
);
fs.writeFileSync('src/utils/diagnostics.ts', code);
