const fs = require('fs');
const glob = require('glob');
const files = glob.sync('src/**/*.tsx');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('useEffect') && (content.includes('api.post') || content.includes('api.patch') || content.includes('api.put') || content.includes('api.delete'))) {
    console.log(`Found mutating API in ${file}`);
  }
});
