const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/App.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace all occurrences of:
// <DedicatedAdminLogin onLoginSuccess={(admin) => {
//    /* set by hook */ (or handled by Context)
//    if (admin) {
//      setRole(admin.role);
//      /* set by hook */
//    }
//    navigate('/admin');
//  }} />
// 
// with:
// <DedicatedAdminLogin onLoginSuccess={(admin) => {
//    if (admin) {
//      login(localStorage.getItem('admin_token') || '', 'Admin', admin.email);
//      setRole(admin.role);
//    }
//    navigate('/admin');
//  }} />

content = content.replace(/<DedicatedAdminLogin onLoginSuccess=\{\(admin\) => \{\s*\/\* handled by Context \*\/\s*if \(admin\) \{\s*setRole\(admin\.role\);\s*\/\* handled by Context \*\/\s*\}\s*navigate\('\/admin'\);\s*\}\} \/>/g, `<DedicatedAdminLogin onLoginSuccess={(admin) => {
    if (admin) {
      login(localStorage.getItem('admin_token') || '', 'Admin', admin.email);
      setRole(admin.role);
    }
    navigate('/admin');
  }} />`);

content = content.replace(/<DedicatedAdminLogin onLoginSuccess=\{\(admin\) => \{\s*\/\* set by hook \*\/\s*if \(admin\) \{\s*setRole\(admin\.role\);\s*\/\* set by hook \*\/\s*\}\s*navigate\('\/admin'\);\s*\}\} \/>/g, `<DedicatedAdminLogin onLoginSuccess={(admin) => {
    if (admin) {
      login(localStorage.getItem('admin_token') || '', 'Admin', admin.email);
      setRole(admin.role);
    }
    navigate('/admin');
  }} />`);

fs.writeFileSync(file, content);
console.log('Patched');
