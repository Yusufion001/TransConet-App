const fs = require('fs');

function replaceFile(path, regex, replacement) {
  let content = fs.readFileSync(path, 'utf-8');
  let original = content;
  content = content.replace(regex, replacement);
  if (content !== original) {
    fs.writeFileSync(path, content);
    console.log(`Updated ${path}`);
  }
}

function replaceAllFile(path, replacements) {
  let content = fs.readFileSync(path, 'utf-8');
  let original = content;
  for (const {regex, replacement} of replacements) {
     content = content.replace(regex, replacement);
  }
  if (content !== original) {
    fs.writeFileSync(path, content);
    console.log(`Updated ${path}`);
  }
}


// FloatingNavHub.tsx
replaceAllFile('frontend/src/components/FloatingNavHub.tsx', [
  // The nav container itself
  {
    regex: /bg-white dark:bg-slate-900 rounded-\[20px\] p-4 shadow-sm border border-slate-100 dark:border-slate-800/g,
    replacement: 'bg-white dark:bg-slate-900 rounded-[20px] p-4 shadow-sm border border-slate-200 dark:border-slate-800'
  },
  // The active state highlight behind icon
  {
    regex: /bg-brand-600 rounded-2xl shadow-md z-0/g,
    replacement: 'bg-brand-50 dark:bg-brand-900/30 rounded-2xl z-0'
  },
  // The active text color
  {
    regex: /isActive\s*\?\s*'text-white'/g,
    replacement: "isActive ? 'text-brand-600'"
  },
  // The close button
  {
    regex: /bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full hover:bg-slate-200/g,
    replacement: 'bg-transparent text-slate-500 dark:text-slate-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800'
  }
]);

// PremiumHeader.tsx
replaceAllFile('frontend/src/components/PremiumHeader.tsx', [
  {
    regex: /<div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-brand-600 flex items-center justify-center shadow-sm">\s*<Package size=\{20\} className="text-white" strokeWidth=\{2\.5\} \/>\s*<\/div>/g,
    replacement: '<div className="flex items-center justify-center"><Package size={28} className="text-brand-600" strokeWidth={2.5} /></div>'
  },
  {
    regex: /<div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">\s*<UserRound size=\{16\} strokeWidth=\{2\} \/>\s*<\/div>/g,
    replacement: '<div className="flex items-center justify-center text-slate-600 dark:text-slate-300"><UserRound size={20} strokeWidth={2} /></div>'
  }
]);

// App.tsx
replaceAllFile('frontend/src/App.tsx', [
  {
    regex: /bg-white dark:bg-slate-900  border px-3 py-1\.5 rounded-xl cursor-pointer transition border-slate-200 dark:border-slate-700 /g,
    replacement: 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 border px-3 py-1.5 rounded-xl cursor-pointer transition border-slate-200 dark:border-slate-700 '
  },
  {
    regex: /hover:bg-slate-100 dark:bg-slate-800 :bg-slate-800/g,
    replacement: 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
  }
]);

// AdminPortalGenerator.tsx
replaceAllFile('frontend/src/components/AdminPortalGenerator.tsx', [
  {
    regex: /bg-brand-600 text-white shadow-md/g,
    replacement: 'bg-brand-50 dark:bg-brand-900/30 text-brand-600'
  }
]);

