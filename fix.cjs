const fs = require('fs');
let code = fs.readFileSync('src/components/AdminOverviewTab.tsx', 'utf8');

code = code.replace(/<\/div>\s*<\/div>\s*\);\s*}/g, '    </div>\n    </div>\n    </div>\n  );\n}');

fs.writeFileSync('src/components/AdminOverviewTab.tsx', code);
