const fs = require('fs');
let code = fs.readFileSync('src/services/loadService.ts', 'utf8');

code = code.replace(
  /const token = typeof localStorage !== 'undefined' \? localStorage\.getItem\('auth_token'\) : null;/g,
  `let token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) token = 'google-token-placeholder';`
);

fs.writeFileSync('src/services/loadService.ts', code);
