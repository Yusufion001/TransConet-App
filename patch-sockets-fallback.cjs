const fs = require('fs');

const fixSocketUrl = (content) => {
  return content.replace(
    /: '',/g,
    `: (import.meta.env.MODE === 'production' ? 'https://transconet-app-production-0e65.up.railway.app' : ''),`
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
