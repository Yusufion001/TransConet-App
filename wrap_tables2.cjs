const fs = require('fs');
const path = require('path');

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

let changed = 0;
for (const file of files) {
  const filePath = path.join(dir, file);
  let code = fs.readFileSync(filePath, 'utf8');
  
  if (code.includes('<table')) {
    let newCode = code.replace(/(?<!<div[^>]*overflow-x-auto[^>]*>\s*)<table([\s\S]*?)<\/table>/g, (match) => {
      // If it's already wrapped, this negative lookbehind isn't perfect in JS if there are newlines, 
      // but let's just do a simpler approach:
      return match; 
    });
    
    // Simpler: Just find `<table` and wrap it if we don't find `<div className="overflow-x-auto">` right before it.
    let modified = false;
    const parts = code.split('<table');
    if (parts.length > 1) {
      for (let i = 0; i < parts.length - 1; i++) {
        const pre = parts[i];
        if (!pre.trimEnd().endsWith('overflow-x-auto">') && !pre.trimEnd().endsWith('overflow-x-auto w-full">') && !pre.match(/overflow-x-[a-z]+[^>]*>\s*$/)) {
           // needs wrap
        }
      }
    }
  }
}
