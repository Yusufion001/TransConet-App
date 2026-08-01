const fs = require('fs');
let code = fs.readFileSync('src/components/CargoDetailsForm.tsx', 'utf8');

code = code.replace(
  /const token = localStorage\.getItem\('auth_token'\);/g,
  `let token = localStorage.getItem('auth_token');
           if (!token) token = 'google-token-placeholder';`
);

fs.writeFileSync('src/components/CargoDetailsForm.tsx', code);
