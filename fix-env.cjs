const fs = require('fs');
const path = require('path');

function replaceFile(file, regex, replacement) {
  const p = path.join(__dirname, file);
  if (!fs.existsSync(p)) return;
  let text = fs.readFileSync(p, 'utf8');
  text = text.replace(regex, replacement);
  fs.writeFileSync(p, text);
}

replaceFile('src/api/client.ts', /import\.meta\.env\.VITE_API_URL \|\| '\/api'/g, "(import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'undefined' && import.meta.env.VITE_API_URL !== 'null') ? import.meta.env.VITE_API_URL : '/api'");
replaceFile('src/components/ExpressMatcher.tsx', /import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:3000'/g, "(import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'undefined' && import.meta.env.VITE_API_URL !== 'null') ? import.meta.env.VITE_API_URL : ''");
replaceFile('src/components/SupportChatWidget.tsx', /import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:3000'/g, "(import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'undefined' && import.meta.env.VITE_API_URL !== 'null') ? import.meta.env.VITE_API_URL : ''");
replaceFile('src/hooks/useAdminLiveData.ts', /import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:3000'/g, "(import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'undefined' && import.meta.env.VITE_API_URL !== 'null') ? import.meta.env.VITE_API_URL : ''");

console.log("Fixed env vars!");
