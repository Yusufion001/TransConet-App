const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function findFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files = files.concat(findFiles(fullPath));
    } else if (stat.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = findFiles(srcDir);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Find all instances of err.response?.data?.error and wrap them
  content = content.replace(/err\.response\?\.data\?\.error/g, "(typeof err.response?.data?.error === 'object' ? JSON.stringify(err.response?.data?.error) : err.response?.data?.error)");
  content = content.replace(/e\.response\?\.data\?\.error/g, "(typeof e.response?.data?.error === 'object' ? JSON.stringify(e.response?.data?.error) : e.response?.data?.error)");
  content = content.replace(/error\.response\?\.data\?\.error/g, "(typeof error.response?.data?.error === 'object' ? JSON.stringify(error.response?.data?.error) : error.response?.data?.error)");

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log("Changed err wrapper:", file);
  }
}
console.log("Done");
