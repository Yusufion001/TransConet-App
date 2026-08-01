const fs = require('fs');
let code = fs.readFileSync('src/routes/authRoutes.ts', 'utf8');

code = code.replace(
  "router.post('/switch-role', authenticateToken, switchUserRole);",
  "router.post('/switch-role', authLimiter, authenticateToken, switchUserRole);"
);
code = code.replace(
  "router.post('/logout', logout);",
  "router.post('/logout', authLimiter, logout);"
);

fs.writeFileSync('src/routes/authRoutes.ts', code);
console.log('Patched authRoutes.ts to include authLimiter everywhere.');
