const fs = require('fs');
let code = fs.readFileSync('src/components/PremiumHeader.tsx', 'utf8');

code = code.replace(
  /className="relative p-2 rounded-full border transition-all cursor-pointer bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm hover:text-blue-600 hover:border-blue-200"/g,
  'className="relative p-2 rounded-full transition-all cursor-pointer text-slate-600 hover:bg-slate-50 hover:text-blue-600"'
);

fs.writeFileSync('src/components/PremiumHeader.tsx', code);
