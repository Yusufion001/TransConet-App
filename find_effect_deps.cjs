const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx');
files.push(...glob.sync('src/**/*.ts'));

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let index = 0;
  while (true) {
    const nextIdx = content.indexOf('useEffect(() => {', index);
    if (nextIdx === -1) break;
    
    let openBraces = 1;
    let curr = nextIdx + 'useEffect(() => {'.length;
    while (curr < content.length && openBraces > 0) {
      if (content[curr] === '{') openBraces++;
      if (content[curr] === '}') openBraces--;
      curr++;
    }
    
    const nextChars = content.substring(curr, curr + 30).trim();
    if (nextChars.startsWith(',')) {
      const closingBracket = nextChars.indexOf(')');
      if (closingBracket !== -1) {
        const deps = nextChars.substring(1, closingBracket).trim();
        console.log(`${file}: deps = ${deps}`);
      }
    } else {
      console.log(`${file}: NO DEPS! ${nextChars}`);
    }
    
    index = nextIdx + 1;
  }
});
