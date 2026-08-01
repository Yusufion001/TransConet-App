const fs = require('fs');
let code = fs.readFileSync('src/components/ExpressMatcher.tsx', 'utf8');

code = code.replace(
  /\? 'text-slate-900  shadow-sm bg-white '/g,
  "? 'text-white shadow-md bg-blue-600 border border-transparent'"
);

fs.writeFileSync('src/components/ExpressMatcher.tsx', code);
