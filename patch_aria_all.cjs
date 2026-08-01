const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
      let code = fs.readFileSync(fullPath, 'utf8');
      let originalCode = code;
      
      // Try adding aria-label to Button and button if they just contain an icon
      code = code.replace(/<Button([^>]*)>(\s*<(?:[A-Z][a-zA-Z0-9]*|svg)[^>]*\/?>(?:\s*<\/[A-Z][a-zA-Z0-9]*>)?\s*)<\/Button>/g, (match, p1, inner) => {
        if (!p1.includes('aria-label')) {
          return `<Button aria-label="Action"${p1}>${inner}</Button>`;
        }
        return match;
      });

      // Same for <a> tags wrapping only icons
      code = code.replace(/<a([^>]*)>(\s*<(?:[A-Z][a-zA-Z0-9]*|svg)[^>]*\/?>(?:\s*<\/[A-Z][a-zA-Z0-9]*>)?\s*)<\/a>/g, (match, p1, inner) => {
        if (!p1.includes('aria-label')) {
          return `<a aria-label="Link"${p1}>${inner}</a>`;
        }
        return match;
      });

      if (code !== originalCode) {
        fs.writeFileSync(fullPath, code);
        // console.log(`Patched aria-labels in ${fullPath}`);
      }
    }
  }
}

processDir('src/components');
console.log('Aria-label sweep complete.');
