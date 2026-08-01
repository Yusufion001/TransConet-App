const fs = require('fs');
let code = fs.readFileSync('src/components/SupportChatWidget.tsx', 'utf8');

code = code.replace(
  /'bg-white  text-slate-900  shadow-sm'/g,
  "'bg-blue-600 text-white shadow-md border border-transparent'"
);

fs.writeFileSync('src/components/SupportChatWidget.tsx', code);
