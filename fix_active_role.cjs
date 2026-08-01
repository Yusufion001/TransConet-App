const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const OLD_ROLE_INIT = /const \[activeRole, setActiveRole\] = useState<string>\(\(\) => \{\n    const token = localStorage\.getItem\('token'\) \|\| localStorage\.getItem\('tc_token'\);\n    \n    if \(token\) \{\n      const payload = parseJwt\(token\);\n      return payload\?\.role \|\| 'CUSTOMER';\n    \}\n    return 'CUSTOMER';\n  \}\);/g;

const NEW_ROLE_INIT = `const [activeRole, setActiveRole] = useState<string>(() => {
    const adminUserStr = localStorage.getItem('admin_user');
    if (adminUserStr) {
      try {
        const adminUser = JSON.parse(adminUserStr);
        if (adminUser?.role) return adminUser.role;
      } catch(e){}
    }
    const token = localStorage.getItem('token') || localStorage.getItem('tc_token');
    
    if (token) {
      const payload = parseJwt(token);
      return payload?.role || 'CUSTOMER';
    }
    return 'CUSTOMER';
  });`;

code = code.replace(OLD_ROLE_INIT, NEW_ROLE_INIT);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched activeRole initialization");
