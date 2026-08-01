const fs = require('fs');

function patchFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  // Replace sameSite: 'lax' with sameSite: 'none'
  code = code.replace(/sameSite:\s*['"]lax['"]/g, "sameSite: 'none'");
  
  // Replace secure: process.env.NODE_ENV === 'production' with secure: true
  code = code.replace(/secure:\s*process\.env\.NODE_ENV\s*===\s*['"]production['"]/g, "secure: true");
  
  fs.writeFileSync(filePath, code);
}

patchFile('src/controllers/authController.ts');
patchFile('src/controllers/admin/adminAuthController.ts');
patchFile('src/server.ts');

console.log("Patched cookies successfully");
