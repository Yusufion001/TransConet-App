const fs = require('fs');
let code = fs.readFileSync('src/components/RouteDistanceCalculator.tsx', 'utf8');

code = code.replace(
  /\{error && \(\s*<div className="bg-rose-500\/10 border border-rose-500\/20 text-rose-400 p-2 rounded-xl text-xs flex items-center gap-2">\s*<AlertCircle size=\{14\} \/>\s*<span>\{error\}<\/span>\s*<\/div>\s*\)\}/g,
  ""
);

fs.writeFileSync('src/components/RouteDistanceCalculator.tsx', code);
