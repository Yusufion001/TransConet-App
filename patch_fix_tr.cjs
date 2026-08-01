const fs = require('fs');
let content = fs.readFileSync('fix_tr.js', 'utf8');
content = content.replace(/\\`/g, '`');
fs.writeFileSync('fix_tr.js', content);
