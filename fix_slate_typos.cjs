const fs = require('fs');
const path = require('path');
function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      filelist.push(dirFile);
    }
  });
  return filelist;
}
const files = walkSync('frontend/src').filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  content = content.replace(/text-slate-\s/g, 'text-slate-400 ');
  content = content.replace(/bg-slate-\s/g, 'bg-slate-800 ');
  content = content.replace(/border-slate-\s/g, 'border-slate-700 ');
  
  // also let's look for text-slate-"
  content = content.replace(/text-slate-"/g, 'text-slate-400"');
  content = content.replace(/bg-slate-"/g, 'bg-slate-800"');
  content = content.replace(/border-slate-"/g, 'border-slate-700"');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log("Fixed typos in", file);
  }
});
