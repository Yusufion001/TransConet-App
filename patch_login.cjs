const fs = require('fs');
let code = fs.readFileSync('src/components/LoginGateway.tsx', 'utf8');

code = code.replace(
  /<\/div>\n                  <\/div>\n                <\/form>/,
  `</div>\n                  </div>\n                </form>\n                <div className="mt-6 text-center">\n                   <button onClick={() => window.location.assign('/admin/login')} className="text-[10px] text-slate-400 hover:text-slate-600 font-medium uppercase tracking-widest transition-colors flex items-center justify-center gap-1 mx-auto"><Shield size={12} /> Admin Portal</button>\n                </div>`
);

if (!code.includes('import { Shield')) {
  code = code.replace(/import \{ Button \} from '\.\/ui\/Button';/, `import { Button } from './ui/Button';\nimport { Shield } from 'lucide-react';`);
}

fs.writeFileSync('src/components/LoginGateway.tsx', code);
