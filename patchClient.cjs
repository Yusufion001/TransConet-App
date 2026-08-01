const fs = require('fs');
let code = fs.readFileSync('src/api/client.ts', 'utf8');
code = code.replace(/} catch \(err: any\) {[\s\S]*?if \(!window.location.pathname.includes\('\/login'\)[\s\S]*?}\n  }/, `} catch (err: any) {\n    console.error('CSRF Token fetch failed permanently:', err?.message || err);\n  }`);
fs.writeFileSync('src/api/client.ts', code);
