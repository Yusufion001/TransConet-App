const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/App.tsx');
let content = fs.readFileSync(file, 'utf8');

// Fix 1: undeclared 'email' in handleLoginSuccess
content = content.replace("login(token, phone, email);", "login(token, phone, payload?.email || '');");

// Fix 2: setIsAuthenticated -> logout() since it uses useAuth() hook
content = content.replace("setIsAuthenticated(false);", "logout();");
content = content.replace("setUserPhone('');", "");
content = content.replace("setUserEmail('');", "");
content = content.replace("setUserEmail(admin.email);", "/* handled by Context */");
content = content.replace("setIsAuthenticated(true);", "/* handled by Context */");

fs.writeFileSync(file, content);
console.log('Patched');
