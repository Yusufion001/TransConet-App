const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/if \(window\.location\.pathname === '\/admin\/login'\) return true;\n/g, '');

code = code.replace(
  /\{window\.location\.pathname === '\/admin\/login'/g,
  `{location.pathname === '/admin/login'`
);

fs.writeFileSync('src/App.tsx', code);
