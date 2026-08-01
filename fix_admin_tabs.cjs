const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortalGenerator.tsx', 'utf8');

code = code.replace(
  /activeTab === tab\.id \n                \? 'bg-blue-600 text-white shadow-md' \n                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'/g,
  "activeTab === tab.id \n                ? 'bg-blue-600 text-white shadow-md' \n                : 'bg-transparent text-slate-600 hover:bg-slate-100'"
);

fs.writeFileSync('src/components/AdminPortalGenerator.tsx', code);
