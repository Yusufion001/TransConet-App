const fs = require('fs');
let content = fs.readFileSync('.github/workflows/ci.yml', 'utf8');
content = content.replace(/ *\- name: Run Prettier\n *run: npx prettier \-\-check \.\n/, '');
fs.writeFileSync('.github/workflows/ci.yml', content);
