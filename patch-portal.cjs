const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortalGenerator.tsx', 'utf8');

code = code.replace(/dashboardMetrics,\n\s*lastSyncedTime,/, `dashboardMetrics,
    dashboardError,
    lastSyncedTime,`);

code = code.replace(/<AdminOverviewTab \n\s*currentRole=\{currentRole\} \n\s*addLog=\{addLog\} \n\s*metrics=\{dashboardMetrics\} \n\s*\/>/m, `<AdminOverviewTab 
            currentRole={currentRole} 
            addLog={addLog} 
            metrics={dashboardMetrics} 
            dashboardError={dashboardError}
          />`);

fs.writeFileSync('src/components/AdminPortalGenerator.tsx', code);
