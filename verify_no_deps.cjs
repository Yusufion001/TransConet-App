const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx').concat(glob.sync('src/**/*.ts'));

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
    
    const nextChars = content.substring(curr, curr + 50).replace(/\s/g, '');
    if (!nextChars.startsWith(',')) {
      console.log(`FOUND MISSING DEPS: ${file}`);
      console.log(`Code around: ${content.substring(curr, curr + 50)}`);
    }
    
    index = nextIdx + 1;
  }
});
