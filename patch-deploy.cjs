const fs = require('fs');
let content = fs.readFileSync('.github/workflows/deploy.yml', 'utf8');
content = content.trim() + '\n';
fs.writeFileSync('.github/workflows/deploy.yml', content);
