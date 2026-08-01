const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortalGenerator.tsx', 'utf8');

code = code.replace(
  /<div className="flex flex-wrap gap-2 pb-2">\r?\n?.*?getTabsForRole\(currentRole\)\.map/g,
  '<div className="flex flex-wrap gap-2 pb-2">\n        {getTabsForRole(currentRole).map'
);

fs.writeFileSync('src/components/AdminPortalGenerator.tsx', code);
