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
    
    const body = content.substring(nextIdx, curr);
    // Find all setters: setSomething(
    const setters = [...body.matchAll(/set[A-Z][a-zA-Z0-9]*\(/g)].map(m => m[0]);
    if (setters.length > 0) {
      // Find the dependency array
      const nextChars = content.substring(curr, curr + 200).trim();
      let deps = "NO_DEPS";
      if (nextChars.startsWith(',')) {
        const closingBracket = nextChars.indexOf(')');
        if (closingBracket !== -1) {
          deps = nextChars.substring(1, closingBracket).trim();
        }
      }
      console.log(`\n${file}:`);
      console.log(`  Setters: ${[...new Set(setters)].join(', ')}`);
      console.log(`  Deps: ${deps}`);
    }
    
    index = nextIdx + 1;
  }
});
