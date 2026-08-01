const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const OLD_EMAIL_INIT = /const \[userEmail, setUserEmail\] = useState\(\(\) => \{\n    const token = localStorage\.getItem\('token'\) \|\| localStorage\.getItem\('tc_token'\);\n    \n    if \(token\) \{\n      const payload = parseJwt\(token\);\n      return payload\?\.email \|\| localStorage\.getItem\('userEmail'\) \|\| '';\n    \}\n    return localStorage\.getItem\('userEmail'\) \|\| '';\n  \}\);/g;

const NEW_EMAIL_INIT = `const [userEmail, setUserEmail] = useState(() => {
    const adminUserStr = localStorage.getItem('admin_user');
    if (adminUserStr) {
      try {
        const adminUser = JSON.parse(adminUserStr);
        if (adminUser?.email) return adminUser.email;
      } catch(e){}
    }
    const token = localStorage.getItem('token') || localStorage.getItem('tc_token');
    
    if (token) {
      const payload = parseJwt(token);
      return payload?.email || localStorage.getItem('userEmail') || '';
    }
    return localStorage.getItem('userEmail') || '';
  });`;

code = code.replace(OLD_EMAIL_INIT, NEW_EMAIL_INIT);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched userEmail initialization");
