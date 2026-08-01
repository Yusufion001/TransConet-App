const fs = require('fs');
let code = fs.readFileSync('src/routes/authRoutes.ts', 'utf8');

code = code.replace(
  /return req\.body\.phoneNumber \|\| 'unknown_ip';/g,
  "return (req.body.phoneNumber && typeof req.body.phoneNumber === 'string' ? req.body.phoneNumber : null) || req.headers['x-forwarded-for'] || req.ip;"
);

fs.writeFileSync('src/routes/authRoutes.ts', code);
