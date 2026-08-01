const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /onLoginSuccess=\{\(\) => window\.location\.href = '\/admin'\}/g,
  `onLoginSuccess={(admin) => {
    setIsAuthenticated(true);
    if (admin) {
      setActiveRole(admin.role);
      setUserEmail(admin.email);
    }
    navigate('/admin');
  }}`
);

fs.writeFileSync('src/App.tsx', code);
