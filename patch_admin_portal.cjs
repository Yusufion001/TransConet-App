const fs = require('fs');

let code = fs.readFileSync('src/components/AdminPortalGenerator.tsx', 'utf8');

const brandStartStr = "{/* Upper Brand Console */}";
const brandEndStr = "{/* Real-Time Accuracy & Sync Status Bar */}";

const syncStartStr = "{/* Real-Time Accuracy & Sync Status Bar */}";
const syncEndStr = "<div className=\"flex flex-col lg:flex-row gap-6\">";

const brandStartIdx = code.indexOf(brandStartStr);
const brandEndIdx = code.indexOf(brandEndStr);

const syncEndIdx = code.indexOf(syncEndStr);

if (brandStartIdx !== -1 && syncEndIdx !== -1) {
  const replacement = `
      {/* Upper Brand Console */}
      <AdminBrandConsole />
      
      {/* Real-Time Accuracy & Sync Status Bar */}
      <AdminSyncStatusBar 
        lastSyncedTime={lastSyncedTime}
        isSyncing={isSyncing}
        onSync={syncAllLiveData}
      />
      
      `;
  
  code = code.substring(0, brandStartIdx) + replacement + code.substring(syncEndIdx);
  code = "import { AdminBrandConsole } from './AdminBrandConsole';\nimport { AdminSyncStatusBar } from './AdminSyncStatusBar';\n" + code;
  fs.writeFileSync('src/components/AdminPortalGenerator.tsx', code);
  console.log('Patched AdminBrandConsole and AdminSyncStatusBar out of AdminPortalGenerator.tsx');
} else {
  console.log('Could not find components in AdminPortalGenerator.tsx');
}
