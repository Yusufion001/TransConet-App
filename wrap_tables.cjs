const fs = require('fs');
const glob = require('glob'); // Need to check if available, or just use fs.readdirSync
const path = require('path');

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let code = fs.readFileSync(filePath, 'utf8');
  
  if (code.includes('<table') && !code.includes('overflow-x-auto') && !code.includes('overflow-x-scroll')) {
    console.log(`Wrapping table in ${file}`);
    // Replace <table className="..."> with <div className="overflow-x-auto w-full"><table className="...">
    // Replace </table> with </table></div>
    // This is naive and might break if there are multiple tables or weird formatting, let's be careful.
    
    // Instead of regex replace, let's just add overflow-x-auto to the direct parent container 
    // or just wrap the table.
    
    // Actually, regex for table wrap:
    code = code.replace(/<table([^>]*)>([\s\S]*?)<\/table>/g, (match, attrs, content) => {
      return `<div className="w-full overflow-x-auto">\n      <table${attrs}>${content}</table>\n    </div>`;
    });
    fs.writeFileSync(filePath, code);
  }
}
