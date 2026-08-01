const fs = require('fs');
let code = fs.readFileSync('src/middleware/authMiddleware.ts', 'utf8');

code = code.replace(
  /const secret = process\.env\.JWT_SECRET \|\| \(\(\) => \{[\s\S]*?\}\)\(\);/,
  "const secret = process.env.JWT_SECRET;\n    if (!secret) {\n      throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing.');\n    }"
);

fs.writeFileSync('src/middleware/authMiddleware.ts', code);
