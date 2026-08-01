const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx');
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Match useEffect block
  // A naive approach: find useEffect(() => { ... }
  // Then check what follows it. Is it just `)` or `, [])`?
  
  let index = 0;
  while (true) {
    const nextIdx = content.indexOf('useEffect(() => {', index);
    if (nextIdx === -1) break;
    
    // find the matching closing bracket of the function body
    let openBraces = 1;
    let curr = nextIdx + 'useEffect(() => {'.length;
    while (curr < content.length && openBraces > 0) {
      if (content[curr] === '{') openBraces++;
      if (content[curr] === '}') openBraces--;
      curr++;
    }
    
    // curr is now at the character after the closing brace of the effect body
    const nextChars = content.substring(curr, curr + 20).trim();
    if (nextChars.startsWith(')')) {
      console.log(`${file}: Missing dependency array entirely around index ${nextIdx}`);
      const body = content.substring(nextIdx, curr);
      if (body.includes('set')) {
        console.log('  -> AND it contains a setter!');
      }
    }
    
    index = nextIdx + 1;
  }
});
