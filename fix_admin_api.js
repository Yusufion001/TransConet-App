const fs = require('fs');
let code = fs.readFileSync('src/components/AdminRolePermission.tsx', 'utf8');

code = code.replace(/api\.get\('[^']+'\)/g, "api.get('/admin/management')");
code = code.replace(/api\.put\(`[^`]+`/g, "api.put(`/admin/management/${editingAdmin.id}`");
code = code.replace(/api\.post\('[^']+'\)/g, "api.post('/admin/management')");
code = code.replace(/api\.delete\(`[^`]+`/g, "api.delete(`/admin/management/${id}`");

fs.writeFileSync('src/components/AdminRolePermission.tsx', code);
