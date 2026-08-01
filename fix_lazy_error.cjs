const fs = require('fs');
let code = fs.readFileSync('src/utils/lazyWithRetry.tsx', 'utf8');
code = code.replace(
  /console\.error\('\[ChunkGuard\] Dynamic import retry exhausted:', thirdError\);/,
  "console.warn('[ChunkGuard] Dynamic import retry exhausted:', thirdError.message);"
);
fs.writeFileSync('src/utils/lazyWithRetry.tsx', code);
