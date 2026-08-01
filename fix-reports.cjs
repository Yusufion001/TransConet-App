const fs = require('fs');

let reportCode = fs.readFileSync('src/components/AdminReportsCenter.tsx', 'utf8');
reportCode = reportCode.replace(/setReports\(\[newReport, \.\.\.reports\]\);/g, 'refetch();');
fs.writeFileSync('src/components/AdminReportsCenter.tsx', reportCode);
