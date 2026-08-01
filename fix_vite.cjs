const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

if (!code.includes('esbuild: { drop:')) {
  code = code.replace(
    /build: \{/,
    "esbuild: { drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [] },\n    build: {"
  );
  fs.writeFileSync('vite.config.ts', code);
}
