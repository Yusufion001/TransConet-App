const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/hooks/useAdminEngine.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace("export function useAdminEngine(\n  userPhone: string,\n  userEmail: string,\n  currentRole: string\n)", "export function useAdminEngine(\n  userPhone: string,\n  userEmail: string,\n  currentRole: string,\n  onRoleSwitched?: (token: string, role: string) => void\n)");

content = content.replace("onRoleSwitched(token, user.role);", "if(onRoleSwitched) onRoleSwitched(token, user.role);");

fs.writeFileSync(file, content);
console.log('Patched admin engine');
