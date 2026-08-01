const fs = require('fs');
const path = require('path');

const files = ['src/supabaseClient.ts', 'src/services/postService.ts'];

for (const file of files) {
  const p = path.join(__dirname, file);
  if (!fs.existsSync(p)) continue;
  let text = fs.readFileSync(p, 'utf8');
  text = text.replace(/if \(!url\) return '';/g, "if (!url || url === 'undefined' || url === 'null') return '';");
  text = text.replace(/if \(!key\) return '';/g, "if (!key || key === 'undefined' || key === 'null') return '';");
  text = text.replace(/sanitizedUrl \|\| 'https:\/\/placeholder[^']+'/g, "(sanitizedUrl && sanitizedUrl.startsWith('http')) ? sanitizedUrl : 'https://placeholder.supabase.co'");
  fs.writeFileSync(p, text);
}
console.log("Fixed!");
