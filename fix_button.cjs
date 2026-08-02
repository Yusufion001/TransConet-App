const fs = require('fs');

const filepath = 'frontend/src/components/ui/Button.tsx';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(
  /primary: '[^']+'/,
  "primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm'"
);

content = content.replace(
  /secondary: '[^']+'/,
  "secondary: 'bg-white text-brand-600 border border-brand-600 hover:bg-brand-50 shadow-sm dark:bg-slate-900 dark:border-brand-600 dark:text-brand-600 dark:hover:bg-slate-800'"
);

content = content.replace(
  /danger: '[^']+'/,
  "danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm'"
);

content = content.replace(/rounded-lg/g, 'rounded-xl');
content = content.replace(/rounded-2xl/g, 'rounded-xl');

fs.writeFileSync(filepath, content);
console.log("Updated Button.tsx");
