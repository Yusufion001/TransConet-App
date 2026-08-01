const fs = require('fs');
const file = 'src/components/AdminUserManagement.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/<div className="hidden md:block overflow-x-auto">/, '<>\n<div className="hidden md:block overflow-x-auto">');
code = code.replace(/<\/div>\n\s*\}\)\}\n\s*<\/div>\n\s*\}\)/, '</div>\n        ))}\n      </div>\n      </>\n      )}');

fs.writeFileSync(file, code);
