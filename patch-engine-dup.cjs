const fs = require('fs');
let code = fs.readFileSync('src/hooks/useAdminEngine.ts', 'utf8');

code = code.replace(/dashboardError,\n\s*dashboardError,/, 'dashboardError,');

fs.writeFileSync('src/hooks/useAdminEngine.ts', code);
