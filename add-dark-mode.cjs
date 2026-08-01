const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  const replacements = [
    { regex: /\bbg-white\b(?!\s+dark:bg-slate-900)/g, replace: 'bg-white dark:bg-slate-900' },
    { regex: /\bbg-slate-50\b(?!\s+dark:bg-slate-800)/g, replace: 'bg-slate-50 dark:bg-slate-800' },
    { regex: /\btext-slate-900\b(?!\s+dark:text-white)/g, replace: 'text-slate-900 dark:text-white' },
    { regex: /\btext-slate-800\b(?!\s+dark:text-slate-100)/g, replace: 'text-slate-800 dark:text-slate-100' },
    { regex: /\btext-slate-700\b(?!\s+dark:text-slate-200)/g, replace: 'text-slate-700 dark:text-slate-200' },
    { regex: /\btext-slate-600\b(?!\s+dark:text-slate-300)/g, replace: 'text-slate-600 dark:text-slate-300' },
    { regex: /\btext-slate-500\b(?!\s+dark:text-slate-400)/g, replace: 'text-slate-500 dark:text-slate-400' },
    { regex: /\bborder-slate-200\b(?!\s+dark:border-slate-700)/g, replace: 'border-slate-200 dark:border-slate-700' },
    { regex: /\bborder-slate-100\b(?!\s+dark:border-slate-800)/g, replace: 'border-slate-100 dark:border-slate-800' }
  ];

  for (let rule of replacements) {
    content = content.replace(rule.regex, rule.replace);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content);
  }
}

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(processFile);
console.log('Done mapping dark mode classes');
