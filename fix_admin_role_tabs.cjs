const fs = require('fs');
let code = fs.readFileSync('src/components/AdminRolePermission.tsx', 'utf8');

code = code.replace(
  /activeTab === 'USERS' \n                  \? 'bg-white text-indigo-600 shadow-sm border border-slate-200' \n                  : 'text-slate-500 hover:text-slate-700 border border-transparent'/g,
  "activeTab === 'USERS' \n                  ? 'bg-blue-600 text-white shadow-md border border-transparent' \n                  : 'text-slate-500 hover:bg-slate-100 border border-transparent'"
);

code = code.replace(
  /activeTab === 'ROLES' \n                  \? 'bg-white text-indigo-600 shadow-sm border border-slate-200' \n                  : 'text-slate-500 hover:text-slate-700 border border-transparent'/g,
  "activeTab === 'ROLES' \n                  ? 'bg-blue-600 text-white shadow-md border border-transparent' \n                  : 'text-slate-500 hover:bg-slate-100 border border-transparent'"
);


fs.writeFileSync('src/components/AdminRolePermission.tsx', code);
