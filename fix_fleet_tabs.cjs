const fs = require('fs');
let code = fs.readFileSync('src/components/TransporterFleetDashboard.tsx', 'utf8');

code = code.replace(
  /activeTab === tab\.id \n                  \? 'bg-slate-800 text-white shadow-md' \n                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'/g,
  "activeTab === tab.id \n                  ? 'bg-blue-600 text-white shadow-md' \n                  : 'bg-transparent text-slate-600 hover:bg-slate-100'"
);

fs.writeFileSync('src/components/TransporterFleetDashboard.tsx', code);
