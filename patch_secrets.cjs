const fs = require('fs');
const files = [
  'src/controllers/authController.ts',
  'src/controllers/roleController.ts',
  'src/middleware/authMiddleware.ts'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  // Find the secret logic and replace it.
  code = code.replace(/process\.env\.JWT_SECRET \|\| \(\(\) => \{[\s\S]*?\}\)\(\);/g, `process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing in production.');
  }
  return 'fallback-secret-key-for-dev-only-do-not-use-in-prod';
})();`);
  fs.writeFileSync(file, code);
});
