const fs = require('fs');
const file = 'src/components/AdminOverviewTab.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/metrics\.totalRevenue\.toLocaleString\(\)/g, "(metrics.totalRevenue || metrics.escrowTotal || 0).toLocaleString()");
code = code.replace(/metrics\.totalRevenue \* 0\.4/g, "(metrics.totalRevenue || metrics.escrowTotal || 0) * 0.4");
code = code.replace(/metrics\.totalRevenue \* 0\.6/g, "(metrics.totalRevenue || metrics.escrowTotal || 0) * 0.6");

fs.writeFileSync(file, code);
