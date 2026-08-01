const fs = require('fs');
let content = fs.readFileSync('src/components/AdminUserManagement.tsx', 'utf8');

// replace error render
content = content.replace(/<AlertTriangle size=\{14\} \/> \{error\}/, '<AlertTriangle size={14} /> {error?.message || error.toString()}');

fs.writeFileSync('src/components/AdminUserManagement.tsx', content);
