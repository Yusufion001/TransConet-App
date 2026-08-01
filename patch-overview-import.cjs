const fs = require('fs');
let code = fs.readFileSync('src/components/AdminOverviewTab.tsx', 'utf8');

code = code.replace(/import \{ Database, RefreshCw, Plus, Radio \} from 'lucide-react';/, `import { Database, RefreshCw, Plus, Radio, AlertCircle } from 'lucide-react';`);

fs.writeFileSync('src/components/AdminOverviewTab.tsx', code);
