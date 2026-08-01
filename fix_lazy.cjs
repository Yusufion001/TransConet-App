const fs = require('fs');
let code = fs.readFileSync('src/utils/lazyWithRetry.tsx', 'utf8');

code = code.replace(
  /window\.location\.reload\(\);/g,
  "window.location.href = window.location.href;"
);

fs.writeFileSync('src/utils/lazyWithRetry.tsx', code);
