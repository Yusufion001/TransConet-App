const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function findJSX(dir) {
  let files = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files = files.concat(findJSX(fullPath));
    } else if (stat.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = findJSX(srcDir);
let changedFiles = [];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace {error} in JSX
  content = content.replace(/\{error\}/g, "{error && typeof error === 'object' ? (error.message || JSON.stringify(error)) : error}");
  
  // Replace {apiError}
  content = content.replace(/\{apiError\}/g, "{apiError && typeof apiError === 'object' ? (apiError.message || JSON.stringify(apiError)) : apiError}");

  // Replace {err}
  content = content.replace(/\{err\}/g, "{err && typeof err === 'object' ? (err.message || JSON.stringify(err)) : err}");

  // Replace {response}
  content = content.replace(/\{response\}/g, "{response && typeof response === 'object' ? (response.message || JSON.stringify(response)) : response}");

  if (content !== original) {
    fs.writeFileSync(file, content);
    changedFiles.push(file);
    console.log("Changed:", file);
  }
}
console.log("Files changed:", changedFiles.length);
