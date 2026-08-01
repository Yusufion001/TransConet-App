const fs = require('fs');
let code = fs.readFileSync('src/components/AdminReportsCenter.tsx', 'utf8');

const importReplacement = `import React, { useState } from 'react';
import { useAdminLiveData } from '../hooks/useAdminLiveData';`;
code = code.replace(/import React, \{ useState \} from 'react';/, importReplacement);

const hookReplacement = `export default function AdminReportsCenter() {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: reportsData, loading, error, isOffline, refetch } = useAdminLiveData<Report[]>({
    endpoint: '/admin/reports',
    queryKey: 'admin_reports',
    autoRefreshInterval: 60000,
    socketEvent: 'report_updated',
    mockData: MOCK_REPORTS
  });

  const reports = reportsData || [];
`;
code = code.replace(/export default function AdminReportsCenter\(\) \{\n\s*const \[reports, setReports\] = useState<Report\[\]>\(MOCK_REPORTS\);\n\s*const \[filterType, setFilterType\] = useState<string>\('ALL'\);\n\s*const \[isGenerating, setIsGenerating\] = useState\(false\);/, hookReplacement);

const genMatch = /const handleGenerate = \(\) => \{\n\s*setIsGenerating\(true\);\n\s*setTimeout\(\(\) => \{\n\s*const newReport: Report = \{\n\s*id: `RPT-\$\{Math.floor\(Math.random\(\) \* 10000\}`,[\s\S]*?setReports\(\[newReport, \.\.\.reports\]\);\n\s*setIsGenerating\(false\);\n\s*\}, 2000\);\n\s*\};/;

const genReplacement = `const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // Logic handled via live data refetch or mock fallback
      setIsGenerating(false);
      refetch();
    }, 2000);
  };`;
code = code.replace(genMatch, genReplacement);

const wrapperMatch = /<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">/;
const uiAdditions = `
      {isOffline && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl flex justify-between items-center">
          <span>You are currently offline. Showing cached data.</span>
        </div>
      )}
      {error && !reports.length && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex justify-between items-center">
          <span>Failed to load live reports. Retrying...</span>
          <button onClick={refetch} className="px-3 py-1 bg-white rounded border border-rose-200 hover:bg-rose-50">Retry</button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">`;
code = code.replace(wrapperMatch, uiAdditions);

const listMatch = /<tbody className="divide-y divide-slate-100 dark:divide-slate-800">/;
const listReplacement = `<tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading && reports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p>Loading live reports...</p>
                      </div>
                    </td>
                  </tr>
                ) : null}`;
code = code.replace(listMatch, listReplacement);

fs.writeFileSync('src/components/AdminReportsCenter.tsx', code);
