const fs = require('fs');
let code = fs.readFileSync('src/components/AdminRolePermission.tsx', 'utf8');

code = code.replace(/import api from '\.\.client';/g, "import api from '../api/client';");

fs.writeFileSync('src/components/AdminRolePermission.tsx', code);
