const fs = require('fs');
let code = fs.readFileSync('src/components/PremiumHeader.tsx', 'utf8');

code = code.replace(
  /showProfile \? 'border-blue-500 bg-blue-50' : 'border-white bg-slate-200'/g,
  "showProfile ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-transparent bg-transparent hover:bg-slate-50 text-slate-600'"
);

fs.writeFileSync('src/components/PremiumHeader.tsx', code);
