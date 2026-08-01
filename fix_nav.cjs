const fs = require('fs');
let code = fs.readFileSync('src/components/FloatingNavHub.tsx', 'utf8');

code = code.replace(
  /isActive \n                          \? 'text-blue-600' \n                          : 'bg-transparent text-slate-500 hover:text-slate-900'/g,
  "isActive \n                          ? 'text-white' \n                          : 'bg-transparent text-slate-500 hover:text-slate-900'"
);

code = code.replace(
  /className="absolute inset-0 bg-blue-50 border border-blue-100 rounded-2xl shadow-sm z-0"/g,
  'className="absolute inset-0 bg-blue-600 rounded-2xl shadow-md z-0"'
);

fs.writeFileSync('src/components/FloatingNavHub.tsx', code);
