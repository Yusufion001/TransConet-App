const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // simplistic check: if setSomething( is called, check if it's inside a function or effect
  // actually, let's just grep for setState calls and see if any are at the top level of the component
});
