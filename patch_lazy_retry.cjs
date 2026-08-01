const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/utils/lazyWithRetry.tsx');
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/window\.location\.href = window\.location\.href;/g, 'window.location.reload();');
fs.writeFileSync(file, content);
console.log('Patched');
