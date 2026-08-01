const fs = require('fs');
let code = fs.readFileSync('src/components/DedicatedAdminLogin.tsx', 'utf8');

const OLD_JSX = /<\/form>\n        <\/div>\n        <div className="bg-slate-50 p-4 border-t border-slate-200 text-center">/;

const NEW_JSX = `</form>
          <div className="mt-4 text-center text-xs text-slate-500">
            <p>Demo Credentials: <b>admin@transconet.ng</b> / <b>SecureAdmin123!</b></p>
          </div>
        </div>
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-center">`;

code = code.replace(OLD_JSX, NEW_JSX);
fs.writeFileSync('src/components/DedicatedAdminLogin.tsx', code);
console.log("Patched login hint");
