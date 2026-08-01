const fs = require('fs');
let code = fs.readFileSync('src/components/AdminOverviewTab.tsx', 'utf8');

code = code.replace(
`export default function AdminOverviewTab({
  currentRole,
  addLog,
  metrics
}: {
  currentRole: string;
  addLog: (msg: string, type: 'info' | 'success' | 'warn' | 'error') => void;
  metrics: any;
}) {`,
`import { AlertCircle } from 'lucide-react';

export default function AdminOverviewTab({
  currentRole,
  addLog,
  metrics,
  dashboardError
}: {
  currentRole: string;
  addLog: (msg: string, type: 'info' | 'success' | 'warn' | 'error') => void;
  metrics: any;
  dashboardError?: string | null;
}) {`
);

code = code.replace(
`    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`,
`    <div className="space-y-6">
      {dashboardError && (
        <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 p-4 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-400">
          <AlertCircle size={20} />
          <div>
            <h3 className="font-bold text-sm">Data Unavailable</h3>
            <p className="text-xs">{dashboardError}</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`
);

code = code.replace(
`    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`,
`    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">` // this was already replaced in previous replace but just in case we need to close the div
);

code = code.replace(/<\/div>\s*$/, `    </div>\n    </div>\n  );\n}`); // we added a parent div

fs.writeFileSync('src/components/AdminOverviewTab.tsx', code);
