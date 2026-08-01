const fs = require('fs');
let content = fs.readFileSync('src/components/FloatingNavHub.tsx', 'utf8');

content = content.replace("import { Button } from './ui/Button';", "import { Button } from './ui/Button';\nimport { DarkModeToggle } from './DarkModeToggle';");

content = content.replace(
  /<h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Menu<\/h3>/g,
  `<h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Menu</h3>\n                <div className="flex items-center gap-2">\n                  <DarkModeToggle />`
);

content = content.replace(
  /<\/Button>\n              <\/div>/g,
  `</Button>\n                </div>\n              </div>`
);

fs.writeFileSync('src/components/FloatingNavHub.tsx', content);
