const fs = require('fs');
const glob = require('glob');
const files = glob.sync('src/**/*.tsx');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let currentUseEffect = null;
  const lines = content.split('\n');
  
  let braceCount = 0;
  let inUseEffect = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('useEffect(() => {') || line.includes('useEffect( () => {')) {
      inUseEffect = true;
      braceCount = 1; // Simplification, not perfect
    } else if (inUseEffect) {
       if (line.includes('api.post') || line.includes('api.patch') || line.includes('api.delete') || line.includes('api.put')) {
          console.log(`Found direct API mutation in ${file}:${i+1}`);
       }
       braceCount += (line.match(/\{/g) || []).length;
       braceCount -= (line.match(/\}/g) || []).length;
       if (braceCount <= 0) {
         inUseEffect = false;
       }
    }
  }
});
