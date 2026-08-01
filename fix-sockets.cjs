const fs = require('fs');

const fixSocketUrl = (content) => {
  return content.replace(
    /io\(\(import\.meta\.env\.VITE_API_URL\s*&&\s*import\.meta\.env\.VITE_API_URL\s*!==\s*'undefined'\s*&&\s*import\.meta\.env\.VITE_API_URL\s*!==\s*'null'\)\s*\?\s*import\.meta\.env\.VITE_API_URL\s*:\s*''\s*,/g,
    `io((import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'undefined' && import.meta.env.VITE_API_URL !== 'null') ? import.meta.env.VITE_API_URL.replace(/\\/api\\/?$/, '') : '', `
  );
};

['src/components/ExpressMatcher.tsx', 'src/components/SupportChatWidget.tsx', 'src/hooks/useAdminLiveData.ts'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = fixSocketUrl(content);
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log("Fixed sockets in", file);
  }
});
