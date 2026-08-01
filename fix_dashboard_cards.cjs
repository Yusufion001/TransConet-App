const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardCards.tsx', 'utf8');

code = code.replace(
  /w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl text-slate-900 z-20 border-2 border-slate-100/g,
  "w-12 h-12 bg-transparent text-emerald-600 flex items-center justify-center z-20"
);

fs.writeFileSync('src/components/DashboardCards.tsx', code);
