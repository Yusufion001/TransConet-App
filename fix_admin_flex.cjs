const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortalGenerator.tsx', 'utf8');

code = code.replace(
  /<div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">/,
  '<div className="flex flex-wrap gap-2 pb-2">'
);

fs.writeFileSync('src/components/AdminPortalGenerator.tsx', code);
