const fs = require('fs');
let code = fs.readFileSync('src/routes/authRoutes.ts', 'utf8');

code = code.replace(
  /return req\.body\.phoneNumber \|\| req\.ip;/g,
  "return req.body.phoneNumber || 'unknown_ip';"
);

fs.writeFileSync('src/routes/authRoutes.ts', code);
