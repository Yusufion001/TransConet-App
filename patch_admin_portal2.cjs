const fs = require('fs');

let code = fs.readFileSync('src/components/AdminPortalGenerator.tsx', 'utf8');

const brandStartStr = "{/* Upper Brand Console */}";
const navStartStr = "{/* Admin Tabs Navigation */}";

const brandStartIdx = code.indexOf(brandStartStr);
const navStartIdx = code.indexOf(navStartStr);

if (brandStartIdx !== -1 && navStartIdx !== -1) {
  const replacement = `
      {/* Upper Brand Console */}
      <AdminBrandConsole />
      
      {/* Real-Time Accuracy & Sync Status Bar */}
      <AdminSyncStatusBar 
        lastSyncedTime={lastSyncedTime}
        isSyncing={isSyncing}
        onSync={syncAllLiveData}
      />
      
      {error && (
        <div className="bg-red-950/40 border border-red-500/40 text-red-200 text-xs p-4 rounded-2xl animate-fade-in flex items-center gap-3">
          <AlertTriangle className="text-red-400 shrink-0" size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs p-4 rounded-2xl animate-fade-in flex items-center gap-3">
          <CheckCircle className="text-emerald-600 shrink-0" size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      `;
  
  code = code.substring(0, brandStartIdx) + replacement + code.substring(navStartIdx);
  code = "import { AdminBrandConsole } from './AdminBrandConsole';\nimport { AdminSyncStatusBar } from './AdminSyncStatusBar';\n" + code;
  fs.writeFileSync('src/components/AdminPortalGenerator.tsx', code);
  console.log('Patched AdminBrandConsole and AdminSyncStatusBar out of AdminPortalGenerator.tsx');
} else {
  console.log('Could not find components in AdminPortalGenerator.tsx');
}
